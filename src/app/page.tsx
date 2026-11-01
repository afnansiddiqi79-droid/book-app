import type { Metadata } from "next";
import HeroSlider from "@/components/home/hero-slider";
import LatestBooks from "@/components/home/latest-books";
import HowItWorks from "@/components/home/how-it-works";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BookNook — A Small Online Library",
  description:
    "BookNook is a small online library where readers discover, borrow and share books.",
};

export default function Home() {
  return (
    <>
      <HeroSlider />

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-royal">
              Fresh arrivals
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-navy sm:text-4xl">
              Latest books
            </h2>
          </div>
          <Link
            href="/books"
            className="rounded-full border border-royal px-6 py-2.5 text-sm font-medium text-royal transition-colors hover:bg-royal hover:text-white"
          >
            See All Books
          </Link>
        </div>

        <div className="mt-12">
          <LatestBooks />
        </div>
      </section>

      <HowItWorks />
    </>
  );
}
