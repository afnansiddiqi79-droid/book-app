import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-serif text-8xl font-semibold text-royal">404</p>
      <h1 className="mt-6 font-serif text-3xl font-semibold text-navy">
        Lost in the stacks?
      </h1>
      <p className="mt-3 max-w-md text-slate">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-royal px-8 py-3 text-sm font-semibold text-white hover:bg-navy"
      >
        Back to Home
      </Link>
    </div>
  );
}
