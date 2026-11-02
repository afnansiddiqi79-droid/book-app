"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { bookService } from "@/services/api";
import { toast } from "sonner";
import BookForm from "@/components/books/book-form";
import type { Book } from "@/types/book";

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    bookService
      .getBook(params.id)
      .then((data) => {
        if (!cancelled) {
          setBook(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load book");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center text-slate">Loading…</div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold text-navy">Edit Book</h1>
        <p className="mt-4 text-slate">You need an account to edit books.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center text-slate">Loading…</div>
    );
  }

  if (error || !book) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="font-medium text-red-700">Book not found.</p>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (user && String(book.addedBy) !== String(user.id)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold text-navy">Edit Book</h1>
        <p className="mt-4 text-slate">
          You can only edit books that you added to BookNook.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-navy">Edit Book</h1>
      <p className="mt-2 text-sm text-slate">{book.title}</p>

      <div className="mt-10">
        <BookForm
          book={book}
          onSuccess={() => {
            toast.success("Book updated!");
            router.push("/my-books");
          }}
        />
      </div>
    </div>
  );
}
