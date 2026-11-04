"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { authClient, API_URL } from "@/services/api";
import type { AuthUser } from "@/services/api";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    image?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Read cached user from localStorage
function readCachedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem("booknook_user");
    return cached ? (JSON.parse(cached) as AuthUser) : null;
  } catch {
    return null;
  }
}

// Module-level auth store so the cached user can be hydrated
// through the external-store subscription instead of setState-in-effect.
let authState: { user: AuthUser | null; isLoading: boolean } = {
  user: null,
  isLoading: true,
};
const authListeners = new Set<() => void>();

function emitAuthChange() {
  authListeners.forEach((listener) => listener());
}

function subscribeAuth(onChange: () => void) {
  authListeners.add(onChange);

  // Hydrate from localStorage on the client once, after mount.
  if (authListeners.size === 1) {
    authState = { user: readCachedUser(), isLoading: false };
    emitAuthChange();
  }

  return () => {
    authListeners.delete(onChange);
  };
}

function getAuthSnapshot() {
  return authState;
}

const authServerSnapshot = { user: null, isLoading: true };

function getAuthServerSnapshot() {
  return authServerSnapshot;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthServerSnapshot
  );

  // Save authentication data
  const setAuthUser = useCallback((nextUser: AuthUser | null) => {
    authState = { user: nextUser, isLoading: false };

    if (nextUser) {
      localStorage.setItem("booknook_user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("booknook_user");
    }

    emitAuthChange();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Login failed");

    const authUser: AuthUser = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      image: data.user.image ?? undefined,
    };

    // data.token is a Better Auth session token, NOT a JWT.
    // Always exchange via GET /api/auth/token to obtain a real JWT.
    let jwtToken: string | null = null;
    try {
      const tokenResponse = await fetch(`${API_URL}/api/auth/token`, {
        method: "GET",
        credentials: "include",
      });
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        jwtToken = tokenData?.token ?? null;
      }
    } catch {
      // Token exchange failed — fall through to error below.
    }
    if (!jwtToken) {
      throw new Error("Login failed: could not obtain JWT token");
    }

    localStorage.setItem("booknook_token", jwtToken);

    setAuthUser(authUser);
  }, [setAuthUser]);

  const signUp = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      image?: string
    ) => {
      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
        ...(image ? { image } : {}),
      });

      if (error) throw new Error(error.message);
      if (!data) throw new Error("Registration failed");

      const authUser: AuthUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        image: data.user.image ?? undefined,
      };

      // data.token is a Better Auth session token, NOT a JWT.
      // Always exchange via GET /api/auth/token to obtain a real JWT.
      let jwtToken: string | null = null;
      try {
        const tokenResponse = await fetch(`${API_URL}/api/auth/token`, {
          method: "GET",
          credentials: "include",
        });
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          jwtToken = tokenData?.token ?? null;
        }
      } catch {
        // Token exchange failed — fall through to error below.
      }

      // If we still have no JWT but the account was created, don't hard-fail.
      // Send the user to log in instead.
      if (!jwtToken) {
        localStorage.removeItem("booknook_token");
        throw new Error("ACCOUNT_CREATED_PLEASE_LOGIN");
      }

      localStorage.setItem("booknook_token", jwtToken);

      setAuthUser(authUser);
    },
    [setAuthUser]
  );

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
    } finally {
      localStorage.removeItem("booknook_token");
      localStorage.removeItem("booknook_user");
      authState = { user: null, isLoading: false };
      emitAuthChange();
    }
  }, []);

  // After Google OAuth redirect, localStorage is empty but a backend session
  // cookie may exist. Check for it on mount so the frontend becomes authenticated.
  useEffect(() => {
    let mounted = true;
    async function initSessionFromBackend() {
      if (!mounted || user) return;
      if (isLoading) return;
      try {
        const sessionResponse = await fetch(`${API_URL}/api/auth/get-session`, {
          method: "GET",
          credentials: "include",
        });
        if (!sessionResponse.ok) return;
        const sessionData = await sessionResponse.json();
        if (!sessionData?.user) return;

        const tokenResponse = await fetch(`${API_URL}/api/auth/token`, {
          method: "GET",
          credentials: "include",
        });
        if (!tokenResponse.ok) return;
        const tokenData = await tokenResponse.json();
        if (!tokenData?.token) return;

        const authUser: AuthUser = {
          id: sessionData.user.id,
          name: sessionData.user.name,
          email: sessionData.user.email,
          image: sessionData.user.image ?? undefined,
        };

        if (mounted) {
          localStorage.setItem("booknook_token", tokenData.token);
          localStorage.setItem("booknook_user", JSON.stringify(authUser));
          setAuthUser(authUser);
        }
      } catch {
        // No backend session — user remains unauthenticated.
      }
    }
    initSessionFromBackend();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear frontend auth state when a protected request returns 401.
  useEffect(() => {
    const handleAuthExpired = () => {
      authState = { user: null, isLoading: false };
      localStorage.removeItem("booknook_token");
      localStorage.removeItem("booknook_user");
      emitAuthChange();
    };
    window.addEventListener("booknook-auth-expired", handleAuthExpired);
    return () => {
      window.removeEventListener("booknook-auth-expired", handleAuthExpired);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [user, isLoading, signIn, signUp, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Auth Hook
export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}
