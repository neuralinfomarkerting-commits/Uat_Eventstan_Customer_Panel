"use client";
import { useState } from "react";
import { Promotion } from "@/types";
import { useAddToCart } from "@/lib/useAddToCart";
import ConfigureCartModal from "@/components/ui/Configurecartmodal";
import CurrencySymbol from "@/components/ui/CurrencySymbol";
import DiscountBadge from "./DiscountBadge";
import CountdownTimer from "./CountdownTimer";
import PromoDetailModal from "./PromoDetailModal";

const BADGE_COLORS: Record<string, string> = {
  Entertainment: "bg-purple-500",
  Venue: "bg-blue-500",
  Decor: "bg-pink-500",
  Catering: "bg-green-600",
  Rentals: "bg-amber-600",
};

const MAX_VISIBLE_INCLUSIONS = 4;

export default function PromotionCard({
  promo,
  onBook,
}: {
  promo: Promotion;
  onBook: (p: Promotion) => void;
}) {
  const [showDetail, setShowDetail] = useState(false);

  const promoImage =
    typeof promo.image_url === "string" ? promo.image_url.trim() : "";
  const hasImage = promoImage.length > 0;
  const hasMoreInclusions = promo.inclusions.length > MAX_VISIBLE_INCLUSIONS;

  const promoAsPkg = {
    id: promo.id,
    service_id: promo.service_id,
    name: promo.title,
    description: promo.short_desc,
    price: promo.price,
    price_unit: promo.price_unit,
    features: promo.inclusions,
    max_guests: promo.max_guests,
    duration_hours: promo.duration_hours,
    is_rental: promo.is_rental,
    delivery_available: promo.delivery_available,
    delivery_fee: promo.delivery_fee,
    min_days: promo.min_days,
    max_days: promo.max_days,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    min_hours: (promo as any).min_hours,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    max_hours: (promo as any).max_hours,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    min_persons: (promo as any).min_persons,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    max_persons: (promo as any).max_persons,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    min_pieces: (promo as any).min_pieces,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    max_pieces: (promo as any).max_pieces,
  };

  const promoAsService = {
    id: promo.service_id,
    category: promo.category,
    vendor_name: promo.vendor_name || promo.vendor_handle,
    image_url: promo.image_url,
  };

  const { inCart, showConfigure, setShowConfigure, handleAddToCart } =
    useAddToCart(promoAsPkg, promoAsService);

  return (
    <>
      <div
        className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col ${
          promo.is_featured ? "border-orange-200 ring-1 ring-orange-100" : "border-gray-100"
        }`}
      >
        <div className="relative h-52 overflow-hidden flex-shrink-0">
          {hasImage ? (
            <img
              src={promoImage}
              alt={promo.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <span
            className={`absolute top-3 left-3 ${BADGE_COLORS[promo.category] || "bg-gray-600"} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}
          >
            {promo.badge || promo.category}
          </span>

          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
            {promo.original_price && (
              <DiscountBadge original={promo.original_price} current={promo.price} />
            )}
            {promo.is_featured && (
              <span className="bg-black/60 backdrop-blur-sm text-orange-300 text-xs font-bold px-2 py-0.5 rounded-full border border-orange-400/30">
                ⭐ Featured
              </span>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
            <h3 className="text-white font-bold text-base leading-snug line-clamp-1">{promo.title}</h3>
            <p className="text-white/70 text-xs">{promo.vendor_handle}</p>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <p className="text-gray-500 text-sm leading-relaxed mb-3 line-clamp-2">{promo.short_desc}</p>

          <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Up to {promo.max_guests.toLocaleString()} guests
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0114 0z" />
              </svg>
              {promo.duration_hours}h
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2h2z" />
              </svg>
              {promo.price_unit}
            </span>
          </div>

          <ul className="space-y-1 mb-4 flex-1">
            {promo.inclusions.slice(0, MAX_VISIBLE_INCLUSIONS).map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                <svg className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
            {hasMoreInclusions && (
              <li
                onClick={() => setShowDetail(true)}
                className="text-xs text-orange-500 font-semibold pl-5 cursor-pointer hover:underline"
              >
                View Details
              </li>
            )}
          </ul>

          <div className="flex items-end gap-2 mb-4">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                <CurrencySymbol currency="AED" />
                {promo.price.toLocaleString()}
              </span>
              <span className="text-gray-400 text-sm ml-1">/ {promo.price_unit}</span>
            </div>
            {promo.original_price && (
              <span className="text-sm text-gray-400 line-through mb-0.5">
                <CurrencySymbol currency="AED" />
                {promo.original_price.toLocaleString()}
              </span>
            )}
          </div>

          {promo.expires_at && (
            <div className="mb-3">
              <CountdownTimer expiresAt={promo.expires_at} />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => !inCart && handleAddToCart()}
              disabled={inCart}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition-all active:scale-95 ${
                inCart
                  ? "bg-white text-gray-500 border-gray-200 cursor-default"
                  : "bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50"
              }`}
            >
              <svg className={`w-4 h-4 ${inCart ? "text-orange-400" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {inCart ? (
                  <>
                    <circle cx="12" cy="12" r="9" strokeWidth={1.6} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12l2 2 4-4" />
                  </>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                )}
              </svg>
              {inCart ? "In Cart" : "Add to Cart"}
            </button>

            <button
              onClick={() => onBook(promo)}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {showConfigure && (
        <ConfigureCartModal
          pkg={promoAsPkg as any}
          service={promoAsService as any}
          onClose={() => setShowConfigure(false)}
        />
      )}

      {showDetail && (
        <PromoDetailModal
          promo={promo}
          onClose={() => setShowDetail(false)}
          onAddToCart={handleAddToCart}
          onBook={() => onBook(promo)}
          inCart={inCart}
        />
      )}
    </>
  );
}