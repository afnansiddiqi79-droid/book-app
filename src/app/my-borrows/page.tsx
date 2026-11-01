"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { bookService } from "@/services/api";
import type { Borrow } from "@/types/borrow";
import { toast } from "sonner";

export default function MyBorrowsPage() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    bookService
      .getBorrows()
      .then((data) => {
        if (!cancelled) {
          setBorrows(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load borrows");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleReturn(borrowId: string) {
    try {
      await bookService.returnBorrow(borrowId);
      toast.success("Book returned. Thanks for reading!");
      const data = await bookService.getBorrows();
      setBorrows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to return book");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="animate-pulse rounded-2xl bg-white p-10">
          <div className="h-6 w-48 rounded bg-ice" />
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-ice" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
          <p className="font-medium text-red-700">Borrows could not be loaded.</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-navy">My Borrows</h1>
      <p className="mt-2 text-sm text-slate">Books you have borrowed from BookNook.</p>

      {borrows.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-navy/30 bg-white p-10 text-center">
          <p className="font-medium text-ink">No borrows yet.</p>
          <p className="mt-2 text-sm text-slate">
            Browse the catalogue and borrow your first book.
          </p>
          <Link
            href="/books"
            className="mt-6 inline-block rounded-full bg-royal px-6 py-2.5 text-sm font-medium text-white hover:bg-navy"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {borrows.map((borrow) => (
            <div
              key={borrow._id}
              className="flex items-center gap-5 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm"
            >
              <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-ice">
                {borrow.bookImage ? (
                  <Image
                    src={borrow.bookImage}
                    alt={borrow.bookTitle}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-lg font-semibold text-ink truncate">
                  {borrow.bookTitle}
                </p>
                <p className="text-sm text-slate">
                  Borrowed {new Date(borrow.borrowDate).toLocaleDateString()}
                </p>
              </div>
              {borrow.status === "borrowed" ? (
                <button
                  type="button"
                  onClick={() => void handleReturn(borrow._id)}
                  className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-royal"
                >
                  Return
                </button>
              ) : (
                <span className="rounded-full bg-ice px-4 py-1.5 text-xs font-medium text-slate">
                  Returned
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
