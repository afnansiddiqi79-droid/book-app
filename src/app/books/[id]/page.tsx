"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { bookService } from "@/services/api";
import type { Book } from "@/types/book";

export default function BookDetailsPage() {
  const params = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBorrowModal, setShowBorrowModal] = useState(false);

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

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="animate-pulse rounded-2xl bg-white p-10">
          <div className="aspect-[3/4] max-w-sm rounded-xl bg-ice" />
          <div className="mt-8 h-8 w-3/4 rounded bg-ice" />
          <div className="mt-4 h-5 w-1/2 rounded bg-ice" />
          <div className="mt-6 h-4 w-full rounded bg-ice" />
          <div className="mt-2 h-4 w-full rounded bg-ice" />
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
          <p className="font-medium text-red-700">Book not found.</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <Link
            href="/books"
            className="mt-6 inline-block rounded-full border border-red-300 px-6 py-2 text-sm font-medium text-red-700"
          >
            Back to All Books
          </Link>
        </div>
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/books"
        className="text-sm font-medium text-royal hover:text-navy"
      >
        ← Back to All Books
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-ice shadow-xl">
          {book.image ? (
            <Image
              src={book.image}
              alt={book.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif text-6xl text-navy/30">?</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-royal">
            {book.category}
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-navy sm:text-5xl">
            {book.title}
          </h1>
          <p className="mt-3 text-xl text-slate">by {book.author}</p>
          <p className="mt-6 text-sm text-slate">
            Added by {book.addedByName}
          </p>

          <p className="mt-8 leading-relaxed text-ink/80">{book.description}</p>

          <div className="mt-10 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate">Total copies</span>
              <span className="font-semibold text-ink">{book.totalCopies}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-slate">Available copies</span>
              <span className="font-semibold text-royal">{book.availableCopies}</span>
            </div>
          </div>

          <div className="mt-8">
            {isAvailable ? (
              <button
                type="button"
                onClick={() => setShowBorrowModal(true)}
                className="w-full rounded-full bg-royal px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-navy"
              >
                Borrow This Book
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full rounded-full bg-navy/30 px-8 py-4 text-sm font-semibold text-white"
              >
                Not Available
              </button>
            )}
          </div>
        </div>
      </div>

      {showBorrowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <h2 className="font-serif text-2xl font-semibold text-navy">
              Borrow this book
            </h2>
            <p className="mt-2 text-sm text-slate">
              Confirm the borrowing details below.
            </p>

            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-ink">
                Your name
                <input
                  type="text"
                  disabled
                  className="mt-1 w-full rounded-xl border border-navy/20 bg-ice px-4 py-2.5 text-sm text-ink outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-ink">
                Your email
                <input
                  type="email"
                  disabled
                  className="mt-1 w-full rounded-xl border border-navy/20 bg-ice px-4 py-2.5 text-sm text-ink outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-ink">
                Borrow date
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-navy/20 bg-ice px-4 py-2.5 text-sm text-ink outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-ink">
                Return date
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-navy/20 bg-ice px-4 py-2.5 text-sm text-ink outline-none"
                />
              </label>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBorrowModal(false)}
                className="rounded-full border border-navy/20 px-6 py-2.5 text-sm font-medium text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-royal px-6 py-2.5 text-sm font-medium text-white hover:bg-navy"
              >
                Confirm Borrow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
