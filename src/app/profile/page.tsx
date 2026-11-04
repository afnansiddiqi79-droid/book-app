"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { bookService, borrowService } from "@/services/api";
import type { Book } from "@/types/book";
import type { Borrow } from "@/types/borrow";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut, updateUserName } =
    useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Edit Name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleEditNameClick() {
    setNameValue(user?.name ?? "");
    setNameMessage(null);
    setIsEditingName(true);
  }

  function handleCancelEditName() {
    setIsEditingName(false);
    setNameMessage(null);
  }

  async function handleSaveName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNameMessage(null);

    const trimmed = nameValue.trim();
    if (!trimmed) {
      setNameMessage({ type: "error", text: "Name cannot be empty." });
      return;
    }

    setIsSavingName(true);
    try {
      await updateUserName(trimmed);
      setIsEditingName(false);
      setNameMessage({ type: "success", text: "Name updated successfully." });
      toast.success("Name updated successfully.");
    } catch (err) {
      const text =
        err instanceof Error ? err.message : "Failed to update name.";
      setNameMessage({ type: "error", text });
      toast.error("Failed to update name. Please try again.");
    } finally {
      setIsSavingName(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    if (!user) return;

    bookService
      .getBooks()
      .then((data) => {
        if (cancelled) return;
        setError(null);
        setBooks(data.filter((b) => b.addedBy === user.id));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load your books."
        );
      });

    borrowService
      .getBorrows()
      .then((data: Borrow[]) => {
        if (cancelled) return;
        setError(null);
        setBorrows(
          data.filter((b) => b.userEmail.toLowerCase() === user.email.toLowerCase())
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load your borrows."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="animate-pulse rounded-2xl bg-white p-10">
          <div className="h-6 w-48 rounded bg-ice" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold text-navy">Profile</h1>
        <p className="mt-4 text-slate">You need an account to view your profile.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-10">
          <p className="font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-block rounded-full border border-royal px-6 py-2 text-sm font-medium text-royal hover:bg-royal hover:text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-navy">My Profile</h1>

      <div className="mt-10 flex items-center gap-6 rounded-2xl bg-white p-8 shadow-sm">
        <div className="relative h-24 w-24 overflow-hidden rounded-full bg-ice">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif text-3xl font-semibold text-royal">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">{user.name}</h2>
          <p className="text-sm text-slate">{user.email}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="font-serif text-3xl font-semibold text-royal">
            {books.length}
          </p>
          <p className="mt-1 text-xs text-slate">Books added</p>
        </div>
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="font-serif text-3xl font-semibold text-royal">
            {borrows.filter((b) => b.status === "borrowed").length}
          </p>
          <p className="mt-1 text-xs text-slate">Active borrows</p>
        </div>
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="font-serif text-3xl font-semibold text-royal">—</p>
          <p className="mt-1 text-xs text-slate">Member since</p>
        </div>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={() => void signOut().then(() => router.push("/"))}
          className="rounded-full bg-navy px-6 py-2.5 text-sm font-medium text-white hover:bg-royal"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
