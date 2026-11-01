"use client";

import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

const slides = [
  {
    id: 1,
    kicker: "Welcome to BookNook",
    title: "A quieter kind of reading.",
    description:
      "Hand-picked books for slow afternoons, deep focus and long walks between the pages.",
    cta: "Browse Books",
    href: "/books",
    className: "bg-navy",
    kickerColor: "text-ice",
    titleColor: "text-white",
    descriptionColor: "text-white/70",
  },
  {
    id: 2,
    kicker: "Borrowing",
    title: "Borrow a book. Return a book.",
    description:
      "Small library, big reading life — borrow from your neighbours and give great stories a second home.",
    cta: "Start Browsing",
    href: "/books",
    className: "bg-ink",
    kickerColor: "text-ice",
    titleColor: "text-white",
    descriptionColor: "text-white/70",
  },
  {
    id: 3,
    kicker: "Community",
    title: "Stories worth sharing.",
    description:
      "Discover what your reading community is reaching for next, and follow the trail of great recommendations.",
    cta: "Explore Books",
    href: "/books",
    className: "bg-ice",
    kickerColor: "text-royal",
    titleColor: "text-navy",
    descriptionColor: "text-slate",
  },
];

export default function HeroSlider() {
  const router = useRouter();

  return (
    <section className="relative w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        loop
        className="!h-[420px] sm:!h-[520px]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className={slide.className}>
            <div className="relative h-full">
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center sm:px-16">
                <p
                  className={`mb-4 text-xs font-semibold uppercase tracking-[0.3em] ${slide.kickerColor}`}
                >
                  {slide.kicker}
                </p>
                <h1
                  className={`max-w-2xl font-serif text-4xl font-semibold leading-tight sm:text-6xl ${slide.titleColor}`}
                >
                  {slide.title}
                </h1>
                <p className={`mt-6 max-w-xl text-base sm:text-lg ${slide.descriptionColor}`}>
                  {slide.description}
                </p>
                <button
                  type="button"
                  onClick={() => router.push(slide.href)}
                  className={`mt-10 rounded-full px-8 py-3 text-sm font-semibold transition-colors ${
                    slide.className === "bg-ice"
                      ? "bg-navy text-white hover:bg-royal"
                      : "bg-royal text-white hover:bg-navy"
                  }`}
                >
                  {slide.cta}
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
