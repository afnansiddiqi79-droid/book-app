"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/services/api";
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
    const cached = window.localStorage.getItem("booknook_user");
    return cached ? (JSON.parse(cached) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readCachedUser);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await authService.signIn(email, password);
    window.localStorage.setItem("booknook_token", res.token);
    window.localStorage.setItem("booknook_user", JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await authService.signUp(name, email, password);
      window.localStorage.setItem("booknook_token", res.token);
      window.localStorage.setItem("booknook_user", JSON.stringify(res.user));
      setUser(res.user);
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
    } catch {
      // Token may already be invalid; clear local state regardless.
    }
    window.localStorage.removeItem("booknook_token");
    window.localStorage.removeItem("booknook_user");
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      signIn,
      signUp,
      signOut,
    }),
    [user, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
