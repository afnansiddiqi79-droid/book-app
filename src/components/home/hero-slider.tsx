"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

const FALLBACK_IMAGE =
  "https://placehold.co/1920x1080/101D3A/FFFFFF?text=BookNook";

const slides = [
  {
    id: 1,
    kicker: "Welcome to BookNook",
    title: "A quieter kind of reading.",
    description:
      "Hand-picked books for slow afternoons, deep focus and long walks between the pages.",
    cta: "Browse Books",
    href: "/books",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: 2,
    kicker: "Borrowing",
    title: "Borrow a book. Return a book.",
    description:
      "Small library, big reading life — borrow from your neighbours and give great stories a second home.",
    cta: "Start Browsing",
    href: "/books",
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: 3,
    kicker: "Community",
    title: "Stories worth sharing.",
    description:
      "Discover what your reading community is reaching for next, and follow the trail of great recommendations.",
    cta: "Explore Books",
    href: "/books",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1920&q=80",
  },
];

export default function HeroSlider() {
  const router = useRouter();
  const [failedSlides, setFailedSlides] = useState<Record<number, boolean>>({});

  return (
    <section className="relative w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        loop
        navigation
        pagination={{ clickable: true }}
        className="!h-[420px] sm:!h-[520px]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full">
              <Image
                src={failedSlides[slide.id] ? FALLBACK_IMAGE : slide.image}
                alt={slide.title}
                fill
                unoptimized
                priority
                onError={() =>
                  setFailedSlides((prev) => ({ ...prev, [slide.id]: true }))
                }
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/70 to-navy/85" />
              <div className="relative h-full flex flex-col items-center justify-center px-6 text-center sm:px-16">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-ice">
                  {slide.kicker}
                </p>
                <h1 className="max-w-2xl font-serif text-4xl font-semibold leading-tight text-white sm:text-6xl">
                  {slide.title}
                </h1>
                <p className="mt-6 max-w-xl text-base text-white/80 sm:text-lg">
                  {slide.description}
                </p>
                <button
                  type="button"
                  onClick={() => router.push(slide.href)}
                  className="mt-10 rounded-full bg-royal px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy"
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
