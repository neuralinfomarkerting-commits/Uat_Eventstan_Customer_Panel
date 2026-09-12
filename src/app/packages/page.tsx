"use client";
import { useState } from "react";
import { useMarketplace } from "@/lib/useMarketplace";
import PackageCard from "@/components/ui/PackageCard";
import BookingModal from "@/components/ui/BookingModal";
import { Package } from "@/types";

export default function PackagesPage() {
  const { services, packages, loading, error } = useMarketplace();
  const [selectedPkg, setSelectedPkg] = useState<Package | undefined>();
  // The service is needed by BookingModal to know the package's category
  // (e.g. "Rentals") so it can correctly show the Quantity / Persons
  // selectors — without it, rental packages silently lose their Quantity
  // stepper when booked directly from this page.
  const selectedService = selectedPkg
    ? services.find((s) => s.id === selectedPkg.service_id)
    : undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Packages</h1>
        <p className="text-gray-500">Pre-made vendor packages — add to cart or book directly</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading packages…</div>
      ) : error ? (
        <div className="text-center py-16 text-red-400">Failed to load packages: {error}</div>
      ) : (
      <div className="space-y-10">
        {services.map((service) => {
          const pkgs = packages.filter((p) => p.service_id === service.id);
          if (pkgs.length === 0) return null;
          return (
            <div key={service.id}>
              <div className="flex items-center gap-4 mb-5">
                <img src={service.image_url} alt={service.title} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{service.title}</h2>
                  <p className="text-sm text-gray-500">{service.location} • {service.category}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pkgs.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} service={service} onBook={(p) => setSelectedPkg(p)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {selectedPkg && (
        <BookingModal
          pkg={selectedPkg}
          service={selectedService}
          onClose={() => setSelectedPkg(undefined)}
        />
      )}
    </div>
  );
}