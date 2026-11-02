"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { bookService } from "@/services/api";
import type { Book } from "@/types/book";
import { toast } from "sonner";

export default function MyBooksPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    bookService
      .getBooks()
      .then((data) => {
        if (cancelled) return;
        setBooks(data.filter((b) => b.addedBy === user.id));
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load books");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleDelete() {
    if (!bookToDelete) return;
    try {
      await bookService.deleteBook(bookToDelete._id);
      toast.success("Book deleted.");
      setBookToDelete(null);
      const data = await bookService.getBooks();
      setBooks(user ? data.filter((b) => b.addedBy === user.id) : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete book");
      setBookToDelete(null);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="animate-pulse rounded-2xl bg-white p-10">
          <div className="h-6 w-48 rounded bg-ice" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold text-navy">My Books</h1>
        <p className="mt-4 text-slate">You need an account to see your books.</p>
        <div className="mt-8 flex justify-center gap-4">
          <a href="/login" className="rounded-full bg-royal px-6 py-2.5 text-sm font-medium text-white">
            Login
          </a>
          <a href="/register" className="rounded-full border border-royal px-6 py-2.5 text-sm font-medium text-royal">
            Register
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-navy">My Books</h1>
      <p className="mt-2 text-sm text-slate">Books you have added to BookNook.</p>

      {loading ? (
        <div className="mt-12 animate-pulse rounded-2xl bg-white p-10">
          <div className="h-6 w-48 rounded bg-ice" />
        </div>
      ) : error ? (
        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
          <p className="font-medium text-red-700">Books could not be loaded.</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      ) : books.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-navy/30 bg-white p-10 text-center">
          <p className="font-medium text-ink">You haven&apos;t added any books yet.</p>
          <p className="mt-2 text-sm text-slate">Share a book with the community.</p>
          <Link
            href="/add-book"
            className="mt-6 inline-block rounded-full bg-royal px-6 py-2.5 text-sm font-medium text-white hover:bg-navy"
          >
            Add a Book
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <div
              key={book._id}
              className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm"
            >
              <Link href={`/books/${book._id}`} className="relative block aspect-[3/4] bg-ice">
                {book.image ? (
                  <Image
                    src={book.image}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                ) : null}
              </Link>
              <div className="p-4">
                <h2 className="font-serif text-lg font-semibold text-ink">{book.title}</h2>
                <p className="text-sm text-slate">{book.author}</p>
                <p className="mt-2 text-xs text-slate">
                  {book.availableCopies} of {book.totalCopies} available
                </p>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/my-books/${book._id}/edit`}
                    className="rounded-full border border-royal px-4 py-1.5 text-xs font-medium text-royal"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setBookToDelete(book)}
                    className="rounded-full bg-navy px-4 py-1.5 text-xs font-medium text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {bookToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <h2 className="font-serif text-2xl font-semibold text-navy">
              Delete this book?
            </h2>
            <p className="mt-2 text-sm text-slate">
              &quot;{bookToDelete.title}&quot; will be permanently removed from the
              library.
            </p>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setBookToDelete(null)}
                className="rounded-full border border-navy/20 px-6 py-2.5 text-sm font-medium text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
