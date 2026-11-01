import Image from "next/image";
import Link from "next/link";
import type { Book } from "@/types/book";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const available = book.availableCopies > 0;

  return (
    <Link
      href={`/books/${book._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] bg-ice">
        {book.image ? (
          <Image
            src={book.image}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-navy/5">
            <span className="font-serif text-4xl text-navy/40">?</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-royal">
          {book.category}
        </p>
        <h3 className="font-serif text-lg font-semibold text-ink group-hover:text-royal">
          {book.title}
        </h3>
        <p className="text-sm text-slate">{book.author}</p>
        <p className="mt-auto pt-2 text-xs text-slate">
          {available
            ? `${book.availableCopies} of ${book.totalCopies} available`
            : "Currently unavailable"}
        </p>
      </div>
    </Link>
  );
}
