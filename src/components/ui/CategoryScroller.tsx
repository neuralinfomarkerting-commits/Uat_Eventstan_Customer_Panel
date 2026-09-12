"use client";
import { useRef, useState, useEffect } from "react";

interface CategoryScrollerProps {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
  loading?: boolean;
}

export default function CategoryScroller({
  categories,
  selected,
  onSelect,
  loading,
}: CategoryScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    setHasOverflow(el.scrollWidth > el.clientWidth + 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    window.addEventListener("resize", checkScroll);
    el?.addEventListener("scroll", checkScroll);
    return () => {
      window.removeEventListener("resize", checkScroll);
      el?.removeEventListener("scroll", checkScroll);
    };
  }, [categories]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  if (loading) {
    return (
      <>
        <div className="cat-scroll-hide flex gap-2 mb-5 overflow-x-auto pb-1 -mx-4 px-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-9 w-20 sm:w-24 bg-gray-100 rounded-full animate-pulse flex-shrink-0"
            />
          ))}
        </div>
        <style jsx global>{`
          .cat-scroll-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .cat-scroll-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="relative mb-5 flex items-center gap-2">
        {/* Left arrow - only rendered when content actually overflows */}
        {hasOverflow && canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="hidden sm:flex flex-shrink-0 w-8 h-8 items-center justify-center rounded-full border shadow-sm transition-all bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-orange-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div className="relative flex-1 min-w-0">
          {/* Left fade */}
          {hasOverflow && canScrollLeft && (
            <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-[5] pointer-events-none" />
          )}

          <div
            ref={scrollRef}
            className="cat-scroll-hide flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelect(cat)}
                className={`snap-start px-4 sm:px-5 py-2 rounded-full text-sm font-medium border transition-all flex-shrink-0 ${
                  selected === cat
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right fade */}
          {hasOverflow && canScrollRight && (
            <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-[5] pointer-events-none" />
          )}
        </div>

        {/* Right arrow - only rendered when content actually overflows */}
        {hasOverflow && canScrollRight && (
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="hidden sm:flex flex-shrink-0 w-8 h-8 items-center justify-center rounded-full border shadow-sm transition-all bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-orange-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      <style jsx global>{`
        .cat-scroll-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .cat-scroll-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}