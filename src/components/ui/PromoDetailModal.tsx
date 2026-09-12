"use client";
import { Promotion } from "@/types";
import CurrencySymbol from "@/components/ui/CurrencySymbol";

const BADGE_COLORS: Record<string, string> = {
  Entertainment: "bg-purple-500",
  Venue: "bg-blue-500",
  Decor: "bg-pink-500",
  Catering: "bg-green-600",
  Rentals: "bg-amber-600",
};

export default function PromoDetailModal({
  promo,
  onClose,
  onAddToCart,
  onBook,
  inCart,
}: {
  promo: Promotion;
  onClose: () => void;
  onAddToCart: () => void;
  onBook: () => void;
  inCart: boolean;
}) {
  const promoImage =
    typeof promo.image_url === "string" ? promo.image_url.trim() : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-sm transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="overflow-y-auto flex-1">
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 pr-8">
              {promo.title}
            </h2>
          </div>

          <div className="relative h-52 flex-shrink-0">
            {promoImage ? (
              <img
                src={promoImage}
                alt={promo.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
            <span
              className={`absolute top-3 left-3 ${BADGE_COLORS[promo.category] || "bg-gray-600"} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}
            >
              {promo.badge || promo.category}
            </span>
          </div>

          <div className="px-6 py-5 space-y-5">
            <p className="text-gray-500 text-sm leading-relaxed">
              {promo.short_desc}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500 border-b border-gray-100 pb-4">
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Up to {promo.max_guests.toLocaleString()} guests
              </span>
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2h2z"
                  />
                </svg>
                {promo.price_unit}
              </span>
              {promo.min_days && promo.max_days && (
                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">
                  min {promo.min_days} – max {promo.max_days}
                </span>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                What&apos;s Included
              </p>
              <ul className="space-y-2">
                {promo.inclusions.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2.5 text-sm text-gray-700"
                  >
                    <svg
                      className="w-4 h-4 text-orange-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {(promo.vendor_name ||
              promo.vendor_email ||
              promo.vendor_phone) && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Vendor
                </p>
                {promo.vendor_name && (
                  <p className="font-bold text-gray-900 text-sm mb-2">
                    {promo.vendor_name}
                  </p>
                )}
                {promo.vendor_email && (
                  <a
                    href={`mailto:${promo.vendor_email}`}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-1.5 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {promo.vendor_email}
                  </a>
                )}
                {promo.vendor_phone && (
                  <a
                    href={`tel:${promo.vendor_phone}`}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {promo.vendor_phone}
                  </a>
                )}
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <span className="text-3xl font-bold text-gray-900">
                <CurrencySymbol currency="AED" />
                {promo.price.toLocaleString()}
              </span>
              <span className="text-gray-400 text-sm ml-1">
                / {promo.price_unit}
              </span>
              {promo.original_price && (
                <span className="text-sm text-gray-400 line-through ml-2">
                  <CurrencySymbol currency="AED" />
                  {promo.original_price.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-white">
          <button
            onClick={() => {
              onAddToCart();
              onClose();
            }}
            disabled={inCart}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              inCart
                ? "bg-white text-gray-500 border-gray-200 cursor-default"
                : "bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-500"
            }`}
          >
            <svg
              className={`w-4 h-4 ${inCart ? "text-orange-400" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {inCart ? (
                <>
                  <circle cx="12" cy="12" r="9" strokeWidth={1.6} />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.6}
                    d="M9 12l2 2 4-4"
                  />
                </>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              )}
            </svg>
            {inCart ? "In Cart" : "Add to Cart"}
          </button>
          <button
            onClick={() => {
              onBook();
              onClose();
            }}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
