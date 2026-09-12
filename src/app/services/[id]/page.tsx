"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMarketplace } from "@/lib/useMarketplace";
import BookingModal from "@/components/ui/BookingModal";
import PackageCard from "@/components/ui/PackageCard";
import { Package } from "@/types";
import { useCart } from "@/lib/CartContext";
import CurrencySymbol from "@/components/ui/CurrencySymbol";

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { services, packages: allPackages, loading, error } = useMarketplace();
  const service = services.find(
    (s) => s.slug === id || String(s.id) === String(id),
  );
  const [showBooking, setShowBooking] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<Package | undefined>();
  const { addService, items } = useCart();
  const [galleryIndex, setGalleryIndex] = useState(0);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400">
        Loading service…
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-red-400">
        Failed to load service: {error}
      </div>
    );
  }
  if (!service) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400">
        <p className="mb-4">Service not found.</p>
        <a
          href="/services"
          className="text-orange-500 font-semibold hover:underline"
        >
          Back to Services
        </a>
      </div>
    );
  }

  const packages = allPackages.filter(
    (p) => String(p.service_id) === String(service.id),
  );
  const rawService = service as unknown as Record<string, unknown>;
  const nestedVendor =
    (rawService["vendor"] as Record<string, unknown> | undefined) ?? {};
  const countryCodeCandidates = [
    "vendor_phone_country_code",
    "vendor_phoneCountryCode",
    "phoneCountryCode",
    "phone_country_code",
    "vendorPhoneCountryCode",
    "vendor_country_code",
    "countryCode",
    "country_code",
  ];
  const rawCountryCode = [
    ...countryCodeCandidates.map((key) => rawService[key]),
    ...countryCodeCandidates.map((key) => nestedVendor[key]),
  ].find((val) => typeof val === "string" && val.trim().length > 0) as
    | string
    | undefined;

  // Build the full phone number, prefixing the vendor's country code
  // (e.g. "+971") when the API provides it separately and it isn't
  // already baked into vendor_phone.
  const vendorPhoneDisplay = service.vendor_phone
    ? rawCountryCode && !service.vendor_phone.trim().startsWith("+")
      ? `${rawCountryCode} ${service.vendor_phone}`
      : service.vendor_phone
    : "";
  const vendorPhoneHref = service.vendor_phone
    ? rawCountryCode && !service.vendor_phone.trim().startsWith("+")
      ? `${rawCountryCode}${service.vendor_phone}`
      : service.vendor_phone
    : "";
  const inCart = items.some((i) => i.id === `svc-${service.id}`);
  const gallery = [
    service.image_url,
    ...(service.gallery || []).filter((url) => url !== service.image_url),
  ].filter(Boolean);

  const nextSlide = () => {
    setGalleryIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevSlide = () => {
    setGalleryIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const handleBookPkg = (pkg: Package) => {
    setSelectedPkg(pkg);
    setShowBooking(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back link */}
      <a
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Services
      </a>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main Content (left 2/3) ── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Image Slider */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] shadow-sm group bg-gray-100">
            {gallery[galleryIndex] ? (
              <img
                src={gallery[galleryIndex]}
                alt={`${service.title} - ${galleryIndex + 1}`}
                className="w-full h-full object-contain transition-all duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm5 3a1 1 0 11-2 0 1 1 0 012 0z"
                  />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
              {service.category}
            </span>

            {/* Slider Navigation Buttons */}
            {gallery.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                  aria-label="Previous image"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                  aria-label="Next image"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {gallery.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setGalleryIndex(idx)}
                      className={`transition-all duration-300 rounded-full ${
                        idx === galleryIndex
                          ? "w-6 h-2 bg-orange-500"
                          : "w-2 h-2 bg-white/60 hover:bg-white/90"
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Image Counter */}
            {gallery.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                {galleryIndex + 1} / {gallery.length}
              </div>
            )}
          </div>

          {/* Title & Meta */}
          <div>
            <span>
              {service.rating > 0 && (
                <span className="flex items-center gap-1 bg-orange-50 px-3 w-28 py-1.5 rounded-full">
                  <svg
                    className="w-4 h-4 text-orange-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-bold text-gray-900 text-sm">
                    {service.rating}
                  </span>
                  <span className="text-gray-400 text-xs">
                    ({service.review_count})
                  </span>
                </span>
              )}
            </span>
            <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {service.title}
                </h1>
                <p className="text-gray-500 flex items-center gap-1 text-sm">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  {service.location}
                </p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Available Packages */}
          {packages.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Available Packages
              </h2>
              <p className="text-gray-500 text-sm mb-5">
                Book a ready-made package from this vendor — fixed price, no
                surprises
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {packages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    service={service}
                    onBook={handleBookPkg}
                  />
                ))}
              </div>
            </div>
          )}

          {/* What's Included */}
          {service.features?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                What&apos;s Included
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {service.features.map((f: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-orange-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar (right 1/3) ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            {/* Pricing */}
            <div className="mb-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
                Starting from
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  <CurrencySymbol currency="AED" />
                  {service.price_min?.toLocaleString()}
                </span>
                {service.price_max && (
                  <span className="text-gray-400 text-base">
                    {" "}
                    – <CurrencySymbol currency="AED" />
                    {service.price_max?.toLocaleString()}
                  </span>
                )}
              </div>
              {service.price_unit && (
                <span className="text-sm text-gray-400">
                  {service.price_unit}
                </span>
              )}
            </div>

            {/* Request Booking */}
            <button
              onClick={() => router.push("/contact")}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors mb-5"
            >
              Request Booking
            </button>

            {/* Vendor Info */}
            <div className="border-t border-gray-100 pt-5 space-y-3 text-sm">
              <h4 className="font-semibold text-gray-900 text-sm">
                Vendor Info
              </h4>

              <div className="flex items-center gap-2 text-gray-700">
                <svg
                  className="w-4 h-4 text-orange-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="font-medium">{service.vendor_name}</span>
              </div>

              {service.vendor_phone && (
                <a
                  href={`tel:${vendorPhoneHref}`}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
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
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {vendorPhoneDisplay}
                </a>
              )}

              {service.vendor_email && (
                <a
                  href={`mailto:${service.vendor_email}`}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
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
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {service.vendor_email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingModal
          pkg={selectedPkg}
          service={service}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}