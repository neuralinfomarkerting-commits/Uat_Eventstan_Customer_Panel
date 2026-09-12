"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { CategoryWithMetadata } from "@/services/api/event.service";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CategorySlider({
  categories,
}: {
  categories: CategoryWithMetadata[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);
  const isPausedByClick = useRef(false);
  const resumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const CARD_WIDTH = 220 + 16; // card width + gap (matches sm:w-[220px] + gap-4)

  // ─── Auto-slide (continuous, same card style as static grid) ──────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || categories.length === 0) return;

    const speed = 0.6; // px per tick — tweak for faster/slower slide
    let frameId: number;

    const tick = () => {
      if (!isHovered.current && !isPausedByClick.current) {
        el.scrollLeft += speed;
        // Loop back smoothly once we've scrolled past the first set
        const singleSetWidth = el.scrollWidth / 2;
        if (el.scrollLeft >= singleSetWidth) {
          el.scrollLeft -= singleSetWidth;
        }
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [categories.length]);

  // ─── Manual scroll via arrow buttons ────────────────────────────────
  const scrollByCard = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el || el.scrollWidth === 0) return; // guard: skip if not ready yet

    isPausedByClick.current = true;
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);

    const delta = direction === "left" ? -CARD_WIDTH * 2 : CARD_WIDTH * 2;
    el.scrollBy({ left: delta, behavior: "smooth" });

    // Handle seamless loop boundaries after manual scroll
    const singleSetWidth = el.scrollWidth / 2;
    setTimeout(() => {
      if (el.scrollLeft <= 0) {
        el.scrollLeft += singleSetWidth;
      } else if (el.scrollLeft >= singleSetWidth) {
        el.scrollLeft -= singleSetWidth;
      }
    }, 350);

    // Resume auto-slide after a short pause
    resumeTimeout.current = setTimeout(() => {
      isPausedByClick.current = false;
    }, 2000);
  };

  if (!categories || categories.length === 0) return null;

  // Duplicate the list so the scroll can loop seamlessly
  const looped = [...categories, ...categories];

  return (
    <div
      className="relative"
      onMouseEnter={() => (isHovered.current = true)}
      onMouseLeave={() => (isHovered.current = false)}
    >
      {/* Left arrow */}
      <button
        onClick={() => scrollByCard("left")}
        aria-label="Previous categories"
        className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Slider track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar"
      >
        {looped.map((cat, i) => (
          <Link
            key={`${cat.id}-${i}`}
            href={`/services?category=${cat.name}`}
            className="flex-shrink-0 w-[45%] sm:w-[220px]"
          >
            <div className="relative rounded-2xl overflow-hidden h-44 group cursor-pointer bg-gray-200">
              <span className="absolute inset-0 flex items-center justify-center text-4xl">
                {cat.icon}
              </span>
              <img
                src={cat.img}
                alt={cat.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
                className="relative w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-lg font-bold">{cat.name}</div>
                <div className="text-xs text-white/80">{cat.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scrollByCard("right")}
        aria-label="Next categories"
        className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}