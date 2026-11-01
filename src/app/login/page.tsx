"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      toast.error("Login failed. Please try again.");
    } finally {
      setSubmitting(false);
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
