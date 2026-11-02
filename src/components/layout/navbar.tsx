"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const PUBLIC_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Books", href: "/books" },
];

const PRIVATE_LINKS = [
  { label: "Add Book", href: "/add-book" },
  { label: "My Books", href: "/my-books" },
  { label: "My Borrows", href: "/my-borrows" },
];

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, isLoading, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const links = isAuthenticated
    ? [...PUBLIC_LINKS, ...PRIVATE_LINKS]
    : PUBLIC_LINKS;

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-light/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-semibold text-royal">
            BookNook
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink/80 transition-colors hover:text-royal"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoading ? null : isAuthenticated ? (
            <>
              <Link
                href="/profile"
                className="rounded-full border border-royal px-5 py-2 text-sm font-medium text-royal transition-colors hover:bg-royal hover:text-white"
              >
                My Profile
              </Link>

              <button
                onClick={() => void handleLogout()}
                className="rounded-full bg-royal px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-navy"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-royal px-5 py-2 text-sm font-medium text-royal transition-colors hover:bg-royal hover:text-white"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-royal px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-navy"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="border-t border-navy/10 md:hidden">
        <div className="flex flex-wrap gap-2 px-4 py-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-navy/20 px-4 py-1.5 text-sm text-ink/80 transition-colors hover:border-royal hover:text-royal"
            >
              {link.label}
            </Link>
          ))}

          {!isLoading &&
            (isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="rounded-full border border-navy/20 px-4 py-1.5 text-sm text-ink/80"
                >
                  My Profile
                </Link>

                <button
                  onClick={() => void handleLogout()}
                  className="rounded-full bg-royal px-4 py-1.5 text-sm text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-navy/20 px-4 py-1.5 text-sm text-ink/80"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-full bg-royal px-4 py-1.5 text-sm text-white"
                >
                  Register
                </Link>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}
