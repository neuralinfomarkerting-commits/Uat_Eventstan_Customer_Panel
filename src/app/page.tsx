"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ServiceCard from "@/components/ui/ServiceCard";
import PreviousWorks from "@/components/PreviousWorks";
import PartnerMarquee from "@/components/PartnerMarquee";
import Testimonials from "@/components/Testimonials";
import { categoryService, CategoryWithMetadata } from "@/services/api/event.service";
import { useMarketplace } from "@/lib/useMarketplace";
import { Search, ClipboardList, PartyPopper, Sparkles, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<CategoryWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { services: allServices, loading: servicesLoading } = useMarketplace();
  const featuredServices = allServices.filter(
    (s) => s.showOnPromotionalPage === true
  );

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const data = await categoryService.fetchCategoriesWithMetadata();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategories(categoryService.getStaticCategories());
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim())
      router.push(`/services?search=${encodeURIComponent(search)}`);
    else router.push("/services");
  };

  return (
    <div>
      {/* Hero Section - Same as before */}
      <section
        className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-x-hidden"
        style={{ background: "#fff5eb" }}
      >
        {/* ... Hero content (same as before) ... */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-orange-300/30 rounded-full blur-3xl opacity-50 max-sm:w-48 max-sm:h-48 max-sm:left-10 max-sm:top-10" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-300/25 rounded-full blur-3xl opacity-50 max-sm:w-56 max-sm:h-56 max-sm:right-10 max-sm:bottom-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-40 left-1/3 w-48 h-48 bg-amber-300/25 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-40 left-10 w-56 h-56 bg-orange-200/20 rounded-full blur-3xl opacity-30" />

        <div className="relative z-10 text-center max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-orange-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-orange-600 font-medium mb-4 sm:mb-6 shadow-sm">
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Your event, perfectly planned
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-bold text-gray-900 leading-tight mb-6 px-2">
            Find the Perfect{" "}
            <span className="text-orange-500 relative inline-block">
              Vendors
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 8"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 6 Q100 0 200 6"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            for Your Event
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-500 mb-6 sm:mb-8 max-w-xl mx-auto px-2">
            Discover and book top-rated venues, decorators, caterers, and
            entertainers — all in one place.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6 sm:mb-8 px-4 sm:px-0">
            <Link
              href="/services"
              className="bg-orange-500 text-white px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base shadow-md hover:shadow-lg"
            >
              Explore Services
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
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <Link
              href="/vendor-partners"
              className="border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-gray-900 hover:border-gray-900 hover:text-white transition-colors text-sm sm:text-base text-center bg-white/50"
            >
              List Your Service
            </Link>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto w-full px-4 sm:px-0">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 w-full"
            >
              <div className="flex-1 relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
                  placeholder="e.g., Wedding, Birthday, Corporate Event"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white shadow-sm"
                  aria-label="Search event type"
                />
              </div>
              <button
                type="submit"
                className="bg-orange-500 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors sm:w-auto w-full shadow-md hover:shadow-lg"
              >
                Search
              </button>
            </form>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 mt-6 sm:mt-8 px-2">
            {[
              ["500+", "Vendors"],
              ["1,200+", "Events"],
              ["4.9★", "Rating"],
            ].map(([num, label]) => (
              <div
                key={label}
                className="bg-white rounded-full px-4 sm:px-5 py-1.5 sm:py-2 shadow-sm border border-gray-100 text-xs sm:text-sm whitespace-nowrap"
              >
                <span className="text-orange-500 font-bold">{num}</span>
                <span className="text-gray-500 ml-1">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section - Using data from service */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/services?category=${cat.name}`}>
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
        )}
      </section>

      {/* API DATA */}
      {/* Featured Services */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Services
            </h2>
            <p className="text-gray-500 mt-1">
              Hand-picked vendors for your next event
            </p>
          </div>
          <Link
            href="/services"
            className="text-orange-500 font-medium hover:text-orange-600 flex items-center gap-1"
          >
            View all →
          </Link>
        </div>
        {servicesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : featuredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="relative rounded-3xl overflow-hidden text-center py-16 px-6 bg-gradient-to-br from-orange-50 via-orange-50 to-amber-50">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-7 h-7 text-orange-500" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              No Featured Services Yet
            </h3>
            <p className="text-gray-500 max-w-xl mx-auto">
              Check back soon — vendors will appear here once they&apos;re
              featured.
            </p>
          </div>
        )}
      </section>
      {/* API DATA */}

      {/* How It Works */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            How It Works
          </h2>
          <p className="text-gray-500 mb-10">
            Three simple steps to your dream event
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                icon: Search,
                title: "Browse Services",
                desc: "Explore our curated collection of premium event vendors across four categories.",
              },
              {
                icon: ClipboardList,
                title: "Request Booking",
                desc: "Send your event details to the vendor and get a personalized quote instantly.",
              },
              {
                icon: PartyPopper,
                title: "Confirm & Celebrate",
                desc: "Lock in your vendor, plan your event, and create unforgettable memories.",
              },
            ].map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-500">
                  <step.icon size={32} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Previous Works */}
      <PreviousWorks />

      {/* Reviews (now a separate component) */}
      <Testimonials />

      {/* Partners */}
      <PartnerMarquee />

      {/* CTA */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <div className="bg-orange-500 rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Ready to Make Your Event Unforgettable?
          </h2>
          <p className="text-orange-100 mb-6">
            Join hundreds of happy clients who found their perfect event vendors
            through EventStan.
          </p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-gray-800 transition-colors"
          >
            Get Started Now →
          </Link>
        </div>
      </section>
    </div>
  );
}