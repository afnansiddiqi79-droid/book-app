"use client";

import { useEffect, useMemo, useState } from "react";
import { bookService } from "@/services/api";
import type { Book } from "@/types/book";
import BookCard from "@/components/books/book-card";

const ALL_CATEGORIES = [
  "Fiction",
  "Science",
  "History",
  "Kids",
  "Others",
];

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(() => {
  if (typeof window === "undefined") return "All";

  const params = new URLSearchParams(window.location.search);
  const selectedCategory = params.get("category");

  return selectedCategory &&
    ALL_CATEGORIES.includes(selectedCategory)
    ? selectedCategory
    : "All";
});

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

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter((book) => {
      const matchesCategory = category === "All" || book.category === category;
      const matchesQuery =
        q === "" ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [books, query, category]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-royal">
            The catalogue
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-navy sm:text-5xl">
            All Books
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or author…"
            aria-label="Search books by title or author"
            className="w-full rounded-full border border-navy/20 bg-white px-5 py-2.5 text-sm text-ink outline-none focus:border-royal sm:w-72"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="rounded-full border border-navy/20 bg-white px-5 py-2.5 text-sm text-ink outline-none focus:border-royal"
          >
            <option value="All">All Categories</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      ) : error ? (
        <div className="mt-16 rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
          <p className="font-medium text-red-700">Books could not be loaded.</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-navy/30 bg-white p-10 text-center">
          <p className="font-medium text-ink">No books found.</p>
          <p className="mt-2 text-sm text-slate">Try a different search or category.</p>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}
    </section>
  );
}
