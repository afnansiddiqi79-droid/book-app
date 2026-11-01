import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-navy/10 bg-ice">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="font-serif text-2xl font-semibold text-royal">BookNook</p>
          <p className="mt-3 max-w-xs text-sm text-slate">
            A small online library where readers discover, borrow and share books.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-royal">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-ink/80">
            <li>
              <Link href="/" className="hover:text-royal">Home</Link>
            </li>
            <li>
              <Link href="/books" className="hover:text-royal">All Books</Link>
            </li>
            <li>
              <Link href="/add-book" className="hover:text-royal">Add Book</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-royal">
            Account
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-ink/80">
            <li>
              <Link href="/login" className="hover:text-royal">Login</Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-royal">Register</Link>
            </li>
            <li>
              <Link href="/my-borrows" className="hover:text-royal">My Borrows</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy/10 py-6 text-center text-xs text-slate">
        © {new Date().getFullYear()} BookNook. All rights reserved.
      </div>
    </footer>
  );
}
