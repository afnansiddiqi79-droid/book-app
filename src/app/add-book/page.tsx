
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import BookForm from "@/components/books/book-form";

export default function AddBookPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Wait until authentication is initialized
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-royal border-t-transparent" />
          <p className="mt-4 text-sm text-slate">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold text-navy">
          Add Book
        </h1>

        <p className="mt-4 text-slate">
          You need an account to add books.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/login"
            className="rounded-full bg-royal px-6 py-2.5 text-sm font-medium text-white"
          >
            Login
          </a>

          <a
            href="/register"
            className="rounded-full border border-royal px-6 py-2.5 text-sm font-medium text-royal"
          >
            Register
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-navy">
        Add Book
      </h1>

      <p className="mt-2 text-sm text-slate">
        Add a new book to the BookNook catalogue.
      </p>

      <div className="mt-10">
        <BookForm
          onSuccess={() => {
            void router.push("/books");
          }}
        />
      </div>

      <p className="mt-6 text-sm text-slate">
        Adding as{" "}
        <span className="font-medium text-ink">
          {user?.name}
        </span>{" "}
        ({user?.email})
      </p>
    </div>
  );
}
