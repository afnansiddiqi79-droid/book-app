
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authClient } from "@/services/api";
import type { AuthUser } from "@/services/api";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readCachedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem("booknook_user");
    return cached ? JSON.parse(cached) as AuthUser : null;
  } catch {
    return null;
  }
}

async function saveAuthData(user: AuthUser) {
  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    throw new Error(error?.message ?? "Could not get authentication token");
  }

  localStorage.setItem("booknook_token", data.token);
  localStorage.setItem("booknook_user", JSON.stringify(user));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readCachedUser);

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

    await saveAuthData(authUser);
    setUser(authUser);
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (error) throw new Error(error.message);
      if (!data) throw new Error("Registration failed");

      const authUser: AuthUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        image: data.user.image ?? undefined,
      };

      await saveAuthData(authUser);
      setUser(authUser);
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
    } finally {
      localStorage.removeItem("booknook_token");
      localStorage.removeItem("booknook_user");
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      signIn,
      signUp,
      signOut,
    }),
    [user, signIn, signUp, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}
