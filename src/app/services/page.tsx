"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CATEGORY_FILTERS } from "@/lib/data";
import CurrencySymbol from "@/components/ui/CurrencySymbol";
import { useMarketplace } from "@/lib/useMarketplace";
import ServiceCard from "@/components/ui/ServiceCard";
import { Service } from "@/types";
import CategoryScroller from "@/components/ui/CategoryScroller";

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
];

const PRICE_RANGES = [
  { label: "Any Price", value: "any" },
  { label: <>Under <CurrencySymbol currency="AED" />500</>, value: "under_500" },
  { label: <><CurrencySymbol currency="AED" />500 – <CurrencySymbol currency="AED" />1,000</>, value: "500_1000" },
  { label: <><CurrencySymbol currency="AED" />1,000 – <CurrencySymbol currency="AED" />5,000</>, value: "1000_5000" },
  { label: <><CurrencySymbol currency="AED" />5,000+</>, value: "5000_plus" },
];

function getPriceFilter(range: string): (s: Service) => boolean {
  switch (range) {
    case "under_500":
      return (s) => s.price_min < 500;
    case "500_1000":
      return (s) => s.price_min >= 500 && s.price_min <= 1000;
    case "1000_5000":
      return (s) => s.price_min > 1000 && s.price_min <= 5000;
    case "5000_plus":
      return (s) => s.price_min > 5000;
    default:
      return () => true;
  }
}

function ServicesContent() {
  const searchParams = useSearchParams();
  const {
    services: SERVICES,
    categories: API_CATEGORIES,
    loading,
    error,
  } = useMarketplace();

  const CATEGORIES = ["All", ...API_CATEGORIES.map((c) => c.name)];

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState("any");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const cat = searchParams.get("category");
    const search = searchParams.get("search");
    if (cat && (cat === "All" || API_CATEGORIES.some((c) => c.name === cat))) {
      setSelectedCategory(cat);
    }
    if (search) setSearchQuery(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, API_CATEGORIES.length]);

  const toggleFilter = (f: string) => {
    setSelectedFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  };

  const priceFilterFn = getPriceFilter(priceRange);

  const filtered = SERVICES.filter((s: Service) => {
    if (selectedCategory !== "All" && s.category !== selectedCategory)
      return false;
    if (!priceFilterFn(s)) return false;
    if (
      selectedFilters.length > 0 &&
      !selectedFilters.some((f) => s.tags.includes(f))
    )
      return false;
    if (
      searchQuery &&
      !s.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "price_asc") return a.price_min - b.price_min;
    if (sortBy === "price_desc") return b.price_min - a.price_min;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "oldest") return String(a.id).localeCompare(String(b.id));
    return String(b.id).localeCompare(String(a.id));
  });

  const currentFilters =
    selectedCategory !== "All" ? CATEGORY_FILTERS[selectedCategory] || [] : [];

  const hasActiveFilters =
    selectedFilters.length > 0 || sortBy !== "newest" || priceRange !== "any";

  const clearAllFilters = () => {
    setSelectedFilters([]);
    setSortBy("newest");
    setPriceRange("any");
  };

  const activeFilterCount =
    selectedFilters.length +
    (sortBy !== "newest" ? 1 : 0) +
    (priceRange !== "any" ? 1 : 0);

  const categoriesLoading = loading && API_CATEGORIES.length === 0;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        Browse Services
      </h1>
      <p className="text-gray-500 text-sm mb-5 sm:mb-6">
        Find the perfect vendors for your event
      </p>

      <CategoryScroller
        categories={CATEGORIES}
        selected={selectedCategory}
        loading={categoriesLoading}
        onSelect={(cat) => {
          setSelectedCategory(cat);
          setSelectedFilters([]);
        }}
      />

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services, cities..."
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-400 bg-white"
          />
        </div>

        <button
          onClick={() => setSidebarOpen(true)}
          className={`lg:hidden relative flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all flex-shrink-0 ${
            hasActiveFilters
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-white text-gray-600 border-gray-200"
          }`}
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          <span className="hidden xs:inline">Filters</span>
          {hasActiveFilters && (
            <span className="absolute -top-1.5 -right-1.5 bg-white text-orange-500 border border-orange-200 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none shadow-sm">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex justify-end"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />

          <div
            className="relative w-[85vw] max-w-xs h-full bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
                  />
                </svg>
                <span className="text-sm font-bold text-gray-900">Filters</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close filters"
              >
                <svg
                  className="w-4 h-4 text-gray-500"
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
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              {currentFilters.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Filter by Type
                  </h3>
                  <div className="space-y-2">
                    {currentFilters.map((f) => (
                      <label
                        key={f}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(f)}
                          onChange={() => toggleFilter(f)}
                          className="accent-orange-500"
                        />
                        <span className="text-sm text-gray-600">{f}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Sort By
                </h3>
                <div className="space-y-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        sortBy === opt.value
                          ? "bg-orange-500 text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Price Range
                </h3>
                <div className="space-y-1">
                  {PRICE_RANGES.map((pr) => (
                    <button
                      key={pr.value}
                      onClick={() => setPriceRange(pr.value)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        priceRange === pr.value
                          ? "bg-orange-500 text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {pr.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 space-y-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 font-medium hover:text-orange-500 transition-colors py-2"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear All Filters
                </button>
              )}
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-full bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
              >
                Show {filtered.length} Result{filtered.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-6 sticky top-24">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
                />
              </svg>
              <span className="text-sm font-bold text-gray-900">Filters</span>
            </div>

            {currentFilters.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Filter by Type
                </h3>
                <div className="space-y-2">
                  {currentFilters.map((f) => (
                    <label
                      key={f}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFilters.includes(f)}
                        onChange={() => toggleFilter(f)}
                        className="accent-orange-500"
                      />
                      <span className="text-sm text-gray-600">{f}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Sort By
              </h3>
              <div className="space-y-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      sortBy === opt.value
                        ? "bg-orange-500 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Price Range
              </h3>
              <div className="space-y-1">
                {PRICE_RANGES.map((pr) => (
                  <button
                    key={pr.value}
                    onClick={() => setPriceRange(pr.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      priceRange === pr.value
                        ? "bg-orange-500 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 font-medium hover:text-orange-500 transition-colors pt-1 border-t border-gray-100"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              Loading services…
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-400">
              Failed to load services: {error}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {filtered.length} services found
              </p>
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                    />
                  </svg>
                  <p>No services match your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {filtered.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ServicesContent />
    </Suspense>
  );
}