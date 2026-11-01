"use client";

import { useEffect, useState } from "react";
import { bookService } from "@/services/api";
import type { Book } from "@/types/book";
import BookCard from "@/components/books/book-card";

export default function LatestBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    bookService
      .getBooks()
      .then((data) => {
        if (!cancelled) {
          setBooks(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load books");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-navy/10 bg-white p-4"
          >
            <div className="aspect-[3/4] rounded-xl bg-ice" />
            <div className="mt-4 h-4 w-24 rounded bg-ice" />
            <div className="mt-2 h-5 w-3/4 rounded bg-ice" />
            <div className="mt-2 h-4 w-1/2 rounded bg-ice" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
        <p className="font-medium text-red-700">We couldn&apos;t load the books.</p>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy/30 bg-white p-10 text-center">
        <p className="font-medium text-ink">No books yet.</p>
        <p className="mt-2 text-sm text-slate">
          Check back soon — our shelves are being restocked.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {books.slice(0, 6).map((book) => (
        <BookCard key={book._id} book={book} />
      ))}
    </div>
  );
}
