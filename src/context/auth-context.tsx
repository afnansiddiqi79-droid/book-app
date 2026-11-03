"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { authClient } from "@/services/api";
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

    // signIn.email() returns session.token (a Better Auth session ID), not a JWT.
    // The backend requireAuth middleware verifies JWTs via JWKS, so we must
    // exchange the session for a JWT via authClient.token() -> GET /api/auth/token.
    const { data: tokenData } = await authClient.token();
    if (!tokenData?.token) {
      throw new Error("Login failed: could not obtain JWT token");
    }

    localStorage.setItem("booknook_token", tokenData.token);

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

      // signUp.email() returns session.token (a Better Auth session ID), not a JWT.
      // When auto-sign-in is skipped (e.g., email verification required),
      // data.token is null and no session cookie is set. In that case we cannot
      // exchange for a JWT via authClient.token() — the account exists but the
      // user must log in separately.
      if (!data.token) {
        throw new Error("ACCOUNT_CREATED_PLEASE_LOGIN");
      }

      // Exchange the session token for a JWT via authClient.token() -> GET /api/auth/token.
      const { data: tokenData } = await authClient.token();
      if (!tokenData?.token) {
        throw new Error("Registration failed: could not obtain JWT token");
      }

      localStorage.setItem("booknook_token", tokenData.token);

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
