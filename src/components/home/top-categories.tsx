
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { bookService } from "@/services/api";
import type { Book } from "@/types/book";

const categories = [
  {
    name: "Fiction",
    description: "Explore imaginative stories",
    icon: "📖",
    style: "from-blue-100 to-indigo-50",
  },
  {
    name: "Science",
    description: "Discover the world of science",
    icon: "🔬",
    style: "from-cyan-100 to-blue-50",
  },
  {
    name: "History",
    description: "Travel through the past",
    icon: "🏛️",
    style: "from-amber-100 to-orange-50",
  },
  {
    name: "Kids",
    description: "Magical stories for little readers",
    icon: "🧸",
    style: "from-pink-100 to-rose-50",
  },
  {
    name: "Others",
    description: "Find something unexpected",
    icon: "✨",
    style: "from-violet-100 to-purple-50",
  },
];

export default function TopCategories() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    let cancelled = false;

    bookService
      .getBooks()
      .then((data) => {
        if (!cancelled) setBooks(data);
      })
      .catch(() => {
        if (!cancelled) setBooks([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-[#F7F9FE] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-royal">
              Explore our collection
            </p>

            <h2 className="mt-3 font-serif text-3xl font-semibold text-navy sm:text-4xl">
              Top Categories
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate">
              Discover your next favorite read from our carefully
              organized book collections.
            </p>
          </div>

          <Link
            href="/books"
            className="rounded-full border border-royal px-6 py-2.5 text-sm font-medium text-royal transition-all hover:bg-royal hover:text-white"
          >
            Explore All Books →
          </Link>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((category) => {
            const count = books.filter(
              (book) => book.category === category.name
            ).length;

            return (
              <Link
                key={category.name}
                href={`/books?category=${encodeURIComponent(category.name)}`}
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${category.style} p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm transition-transform duration-300 group-hover:scale-110">
                  {category.icon}
                </div>

                <h3 className="mt-8 font-serif text-xl font-semibold text-navy">
                  {category.name}
                </h3>

                <p className="mt-2 min-h-10 text-sm leading-6 text-slate">
                  {category.description}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-navy">
                    {count} {count === 1 ? "Book" : "Books"}
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-royal transition-all group-hover:bg-royal group-hover:text-white">
                    →
                  </span>
                </div>

                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full border-[18px] border-white/30" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
