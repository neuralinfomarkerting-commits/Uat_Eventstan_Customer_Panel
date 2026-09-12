"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { getTestimonials, ApiTestimonial } from "@/api/customerApi";

export interface TestimonialItem {
  id: string;
  reviewer_name: string;
  comment: string;
  rating: number;
  image?: string;
}

function mapTestimonial(t: ApiTestimonial): TestimonialItem {
  return {
    id: t.id,
    reviewer_name: t.customerName,
    comment: t.comment,
    rating: t.rating,
    image: t.image?.trim() ? t.image : undefined,
  };
}

// ─── Avatar Colors ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: "#fff4e6", tc: "#9a3412" },
  { bg: "#e0f2fe", tc: "#0369a1" },
  { bg: "#f0fdf4", tc: "#15803d" },
  { bg: "#fdf4ff", tc: "#7e22ce" },
  { bg: "#fff1f2", tc: "#be123c" },
  { bg: "#fefce8", tc: "#a16207" },
  { bg: "#f0fdfa", tc: "#0f766e" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
// Shows the customer's photo when available; falls back to colored initials
// if there's no image or the image URL fails to load.
function Avatar({
  name,
  image,
  bg,
  color,
  outline,
  sizeClassName = "w-16 h-16 text-base",
  className = "",
}: {
  name: string;
  image?: string;
  bg: string;
  color: string;
  outline: string;
  sizeClassName?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = !!image && !failed;

  return (
    <div
      className={`${sizeClassName} rounded-full flex items-center justify-center font-medium overflow-hidden ${className}`}
      style={{
        background: bg,
        color,
        outline,
        outlineOffset: "2px",
      }}
    >
      {showImage ? (
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex justify-center gap-0.5 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="w-3.5 h-3.5"
          fill={i < rating ? "#f97316" : "#e5e7eb"}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────
function ReviewModal({
  review,
  onClose,
}: {
  review: TestimonialItem | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!review) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [review, onClose]);

  if (!review) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-3 sm:px-4 py-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md relative text-center shadow-xl flex flex-col max-h-[85vh] sm:max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10 bg-white"
        >
          ✕
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 sm:px-8 pt-8 sm:pt-8 pb-4">
          <Avatar
            name={review.reviewer_name}
            image={review.image}
            bg="#fff4e6"
            color="#9a3412"
            outline="2.5px solid #f97316"
            sizeClassName="w-14 h-14 sm:w-16 sm:h-16 text-sm sm:text-base"
            className="mx-auto mb-3 sm:mb-4 flex-shrink-0"
          />

          <StarRating rating={review.rating} />

          <p className="text-[13px] sm:text-sm leading-relaxed text-gray-600 whitespace-pre-line text-left sm:text-center">
            {review.comment}
          </p>
        </div>

        {/* Fixed footer with name */}
        <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-2 flex-shrink-0">
          <div className="inline-block max-w-full px-4 sm:px-6 py-2 rounded-full text-[11px] sm:text-xs font-semibold tracking-widest uppercase bg-orange-500 text-white truncate">
            {review.reviewer_name}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────
function ReviewCard({
  review,
  index,
  isActive,
  isNear,
  onClick,
  onReadMore,
}: {
  review: TestimonialItem;
  index: number;
  isActive: boolean;
  isNear: boolean;
  onClick: () => void;
  onReadMore: () => void;
}) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  // Heuristic: if comment is long enough that line-clamp-3 will likely cut it
  const isLong = review.comment.length > 110;

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-[260px] mx-4 rounded-2xl border text-center cursor-pointer select-none bg-white"
      style={{
        padding: "1.75rem 1.5rem 1.5rem",
        transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
        opacity: isActive ? 1 : isNear ? 0.6 : 0.3,
        transform: isActive
          ? "scale(1.07)"
          : isNear
            ? "scale(0.93)"
            : "scale(0.85)",
        borderColor: isActive ? "#fdba74" : "#f3f4f6",
        borderWidth: isActive ? "1.5px" : "1px",
        boxShadow: isActive ? "0 8px 32px rgba(249,115,22,0.12)" : "none",
        position: "relative",
        zIndex: isActive ? 2 : 1,
      }}
    >
      {/* Avatar */}
      <Avatar
        name={review.reviewer_name}
        image={review.image}
        bg={color.bg}
        color={color.tc}
        outline={isActive ? "2.5px solid #f97316" : "2px solid #e5e7eb"}
        className="mx-auto mb-4"
      />

      {/* Stars */}
      <StarRating rating={review.rating} />

      {/* Review text */}
      <p
        className="text-[13px] leading-relaxed mb-1 line-clamp-3 transition-colors duration-500"
        style={{ color: isActive ? "#374151" : "#9ca3af" }}
      >
        {review.comment}
      </p>

      {/* Read more button */}
      {isLong ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReadMore();
          }}
          className="block w-full text-center text-[11px] font-semibold text-orange-500 hover:text-orange-600 mb-3 underline underline-offset-2"
        >
          Read more
        </button>
      ) : (
        <div className="mb-3" />
      )}

      {/* Name button */}
      <div
        className="inline-block px-6 py-2 rounded-full text-xs font-semibold tracking-widest uppercase transition-all duration-500"
        style={{
          background: isActive ? "#f97316" : "#f3f4f6",
          color: isActive ? "#fff" : "#9ca3af",
        }}
      >
        {review.reviewer_name}
      </div>
    </div>
  );
}

// ─── Simple Row ─────────────────────────────────────────────────────────────
// Used when there are too few reviews (1-2) to loop into a carousel without
// visibly duplicating the same card — just show them centered, no cloning,
// no autoplay, no arrows/dots.
function ReviewsRow({ reviews }: { reviews: TestimonialItem[] }) {
  const [modalReview, setModalReview] = useState<TestimonialItem | null>(null);

  return (
    <div className="flex flex-wrap justify-center gap-6 px-4 py-6">
      {reviews.map((review, i) => (
        <ReviewCard
          key={review.id}
          review={review}
          index={i}
          isActive={true}
          isNear={false}
          onClick={() => {}}
          onReadMore={() => setModalReview(review)}
        />
      ))}
      <ReviewModal review={modalReview} onClose={() => setModalReview(null)} />
    </div>
  );
}

// ─── Reviews Slider ───────────────────────────────────────────────────────────
function ReviewsSlider({ reviews }: { reviews: TestimonialItem[] }) {
  const [current, setCurrent] = useState(Math.min(2, reviews.length - 1));
  const [isHovered, setIsHovered] = useState(false);
  const [modalReview, setModalReview] = useState<TestimonialItem | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const CARD_W = 292;
  const CLONES = Math.min(2, reviews.length);
  // With many testimonials (e.g. 30) we don't want 30 dots — cap the strip
  // to a sliding window of this many dots, centered on the active one.
  const MAX_DOTS = 7;

  const goTo = useCallback(
    (idx: number) => {
      setCurrent(((idx % reviews.length) + reviews.length) % reviews.length);
    },
    [reviews.length]
  );

  useEffect(() => {
    if (isHovered || modalReview || reviews.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isHovered, modalReview, reviews.length]);

  useEffect(() => {
    if (!trackRef.current || !viewportRef.current) return;
    const vw = viewportRef.current.offsetWidth;
    const offset = vw / 2 - CARD_W / 2 - (current + CLONES) * CARD_W;
    trackRef.current.style.transform = `translateX(${offset}px)`;
  }, [current, CLONES]);

  const extended = [
    ...reviews.slice(-CLONES),
    ...reviews,
    ...reviews.slice(0, CLONES),
  ];

  // Windowed dot indices — with lots of testimonials we only show a handful
  // of dots around the active one instead of one dot per review. The two
  // outer dots in the window are drawn smaller to hint that more reviews
  // exist beyond them.
  const dotIndices = (() => {
    const total = reviews.length;
    if (total <= MAX_DOTS) return Array.from({ length: total }, (_, i) => i);
    const half = Math.floor(MAX_DOTS / 2);
    let start = current - half;
    let end = start + MAX_DOTS - 1;
    if (start < 0) {
      start = 0;
      end = MAX_DOTS - 1;
    }
    if (end > total - 1) {
      end = total - 1;
      start = end - MAX_DOTS + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  return (
    <div
      ref={viewportRef}
      className="relative w-full overflow-hidden"
      style={{ padding: "40px 0 50px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="pointer-events-none absolute left-0 top-0 h-full w-28 z-10 bg-gradient-to-r from-gray-50 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-28 z-10 bg-gradient-to-l from-gray-50 to-transparent" />

      <div
        ref={trackRef}
        className="flex items-center"
        style={{ transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)" }}
      >
        {extended.map((review, i) => {
          const actualIndex = (i - CLONES + reviews.length) % reviews.length;
          return (
            <ReviewCard
              key={`${review.id}-${i}`}
              review={review}
              index={actualIndex}
              isActive={actualIndex === current}
              isNear={
                Math.abs(actualIndex - current) === 1 ||
                Math.abs(actualIndex - current) === reviews.length - 1
              }
              onClick={() => goTo(actualIndex)}
              onReadMore={() => setModalReview(review)}
            />
          );
        })}
      </div>

      <div className="flex justify-center items-center gap-2 mt-6">
        {dotIndices.map((i) => {
          const isEdgeMore =
            (i === dotIndices[0] && i > 0) ||
            (i === dotIndices[dotIndices.length - 1] && i < reviews.length - 1);
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Review ${i + 1}`}
              className="rounded-full transition-all duration-300 flex-shrink-0"
              style={{
                width: i === current ? "22px" : isEdgeMore ? "5px" : "7px",
                height: isEdgeMore ? "5px" : "7px",
                background: i === current ? "#f97316" : "#e5e7eb",
                opacity: isEdgeMore ? 0.6 : 1,
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            />
          );
        })}
      </div>
      {reviews.length > MAX_DOTS && (
        <div className="text-center text-[11px] text-gray-400 mt-2">
          {current + 1} / {reviews.length}
        </div>
      )}

      <div className="flex justify-center gap-3 mt-4">
        <button
          onClick={() => goTo(current - 1)}
          aria-label="Previous review"
          className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors"
        >
          ←
        </button>
        <button
          onClick={() => goTo(current + 1)}
          aria-label="Next review"
          className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors"
        >
          →
        </button>
      </div>

      <ReviewModal review={modalReview} onClose={() => setModalReview(null)} />
    </div>
  );
}

// ─── Testimonials (Reviews Section) ────────────────────────────────────────────
export default function Testimonials() {
  const [reviews, setReviews] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTestimonials()
      .then((data) => {
        if (!cancelled) setReviews(data.map(mapTestimonial));
      })
      .catch((err) => {
        console.error("Error fetching testimonials:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && reviews.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-2 text-center">
        <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-800 border border-orange-100 rounded-full px-3 py-1 text-[11px] font-medium tracking-widest uppercase mb-4">
          <svg
            className="w-2.5 h-2.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Client reviews
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          What Our Clients Say
        </h2>
        <p className="text-gray-500 mt-1 text-sm">
          Real stories from real celebrations
        </p>
      </div>
      {loading ? (
        <div className="flex justify-center gap-4 px-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="hidden sm:block w-[260px] h-[280px] rounded-2xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : reviews.length <= 2 ? (
        <ReviewsRow reviews={reviews} />
      ) : (
        <ReviewsSlider reviews={reviews} />
      )}
    </section>
  );
}