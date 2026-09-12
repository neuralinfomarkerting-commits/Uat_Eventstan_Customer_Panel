"use client";
import { useEffect, useState, useMemo } from "react";
import { useMarketplace } from "@/lib/useMarketplace";
import { customerApi, ApiCategory } from "@/api/customerApi";
import {
  isPromotionalPackage,
  packageToPromotion,
  RawApiPackage,
} from "@/lib/promotionsMapper";
import { Promotion } from "@/types";
import BookingModal from "@/components/ui/BookingModal";
import PromotionCard from "@/components/ui/PromotionCard";
import CategoryScroller from "@/components/ui/CategoryScroller";

export default function PromotionsPage() {
  const { services, packages, loading, error } = useMarketplace();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [booking, setBooking] = useState<Promotion | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await customerApi.masterData.getCategories();
        if (!cancelled) setCategories(data);
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const CATEGORIES = useMemo(
    () => ["All", ...categories.map((c) => c.name)],
    [categories],
  );

  const categoryByServiceId = useMemo(
    () =>
      services.reduce<Record<string, string>>((acc, s) => {
        if (s.id && s.category) acc[s.id] = s.category;
        return acc;
      }, {}),
    [services],
  );

  const PROMOTIONS: Promotion[] = useMemo(
    () =>
      (packages as RawApiPackage[])
        .filter(isPromotionalPackage)
        .map((pkg) => packageToPromotion(pkg, categoryByServiceId)),
    [packages, categoryByServiceId],
  );

  const filtered = useMemo(() => {
    let result = PROMOTIONS.filter((p) => {
      const matchCat = category === "All" || p.category === category;
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.vendor_name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });

    if (sortBy === "price_asc")
      result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc")
      result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "discount")
      result = [...result].sort((a, b) => {
        const da = a.original_price
          ? (a.original_price - a.price) / a.original_price
          : 0;
        const db = b.original_price
          ? (b.original_price - b.price) / b.original_price
          : 0;
        return db - da;
      });
    if (sortBy === "featured")
      result = [...result].sort(
        (a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0),
      );

    return result;
  }, [PROMOTIONS, search, category, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-1">Promotions</h1>
        <p className="text-gray-500">
          Exclusive deals and special offers from top vendors — limited time,
          fixed price
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search promotions or vendors..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-orange-400 text-gray-700 cursor-pointer"
        >
          <option value="featured">Featured First</option>
          <option value="discount">Biggest Discount</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <CategoryScroller
        categories={CATEGORIES}
        selected={category}
        loading={categoriesLoading}
        onSelect={setCategory}
      />

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          Loading promotions…
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400">
          Failed to load promotions: {error}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-5">
            {filtered.length} promotion{filtered.length !== 1 ? "s" : ""}{" "}
            available
          </p>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((promo) => (
                <PromotionCard
                  key={promo.id}
                  promo={promo}
                  onBook={setBooking}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🎟️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No promotions found
              </h3>
              <p className="text-gray-400 mb-5">
                Try adjusting your filters or search term.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-orange-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      )}

      {booking && (
        <BookingModal
          pkg={
            {
              id: booking.id,
              service_id: booking.service_id,
              title: booking.title,
              description: booking.short_desc,
              price: booking.price,
              price_unit: booking.price_unit,
              isPromotion: true,
              inclusions: booking.inclusions,
              max_guests: booking.max_guests,
              duration_hours: booking.duration_hours,
              // Rental/quantity + persons/days config — without these the
              // Quantity and Persons/Days steppers silently disappear even
              // when the underlying package is a rental.
              is_rental: booking.is_rental,
              delivery_available: booking.delivery_available,
              delivery_fee: booking.delivery_fee,
              min_days: booking.min_days,
              max_days: booking.max_days,
            } as any
          }
          service={
            {
              id: booking.service_id,
              category: booking.category,
              vendor_name: booking.vendor_name,
              vendor_email: booking.vendor_email,
              vendor_phone: booking.vendor_phone,
            } as any
          }
          onClose={() => setBooking(null)}
        />
      )}
    </div>
  );
}