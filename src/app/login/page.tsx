"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { authClient } from "@/services/api";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSigningIn, setGoogleSigningIn] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      toast.success("Welcome back to BookNook!");
      const redirectTo = searchParams.get("redirect");
      router.push(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      toast.error("Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleSigningIn(true);
    try {
      const { data, error: socialError } =
        await authClient.signIn.social({
          provider: "google",
          callbackURL: process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin,
        });
      if (socialError) {
        throw new Error(socialError.message);
      }
      if (!data?.url) {
        throw new Error("No sign-in URL returned from Google.");
      }
      window.location.href = data.url;
    } catch (err) {
      setGoogleSigningIn(false);
      setError(
        err instanceof Error ? err.message : "Google sign-in failed. Please try again."
      );
      toast.error("Google sign-in failed. Please try again.");
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="font-serif text-3xl font-semibold text-navy">Welcome back</h1>
        <p className="mt-2 text-sm text-slate">Log in to your BookNook account.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-ink">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-navy/20 bg-ice px-4 py-2.5 text-sm text-ink outline-none focus:border-royal"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block text-sm font-medium text-ink">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-navy/20 bg-ice px-4 py-2.5 text-sm text-ink outline-none focus:border-royal"
              placeholder="••••••••"
              required
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-navy/20"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-semibold text-slate px-2">
              Or continue with
            </div>
          </div>

          <button
            type="button"
            disabled={googleSigningIn || submitting}
            onClick={handleGoogleSignIn}
            className={`w-full rounded-full border border-navy/20 bg-white px-8 py-2.5 text-sm font-semibold text-ink flex items-center justify-center gap-2 transition-colors hover:bg-ice disabled:opacity-60`}
          >
            <span className="relative flex h-5 w-5 items-center justify-center rounded-full border border-navy/20 bg-royal">
              <span className="text-white font-bold text-xs">G</span>
            </span>
            <span>Continue with Google</span>
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-royal px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy disabled:opacity-60"
          >
            {submitting ? "Logging in…" : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate">
          <Link href="/register" className="font-medium text-royal hover:text-navy">
            Create an account
          </Link>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-sm text-slate underline-offset-4 hover:underline"
          >
            Forgot password? (coming soon)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-royal border-t-transparent" />
            <p className="mt-4 text-sm text-slate">Loading…</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
