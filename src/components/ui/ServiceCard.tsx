"use client";
import { useState } from "react";
import Link from "next/link";
import { Service } from "@/types";
import { useCart } from "@/lib/CartContext";
import CurrencySymbol from "@/components/ui/CurrencySymbol";

interface Props {
  service: Service;
}

export default function ServiceCard({ service }: Props) {
  const { addService, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = items.some((i) => i.id === `svc-${service.id}`);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addService(service);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      <Link href={`/services/${service.slug || service.id}`}>
        <div className="relative h-52 overflow-hidden cursor-pointer bg-gray-100">
          {service.image_url ? (
            <img
              src={service.image_url}
              alt={service.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {service.category}
          </span>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/services/${service.slug || service.id}`}>
          <h3 className="font-semibold text-gray-900 text-base mb-1 hover:text-orange-500 transition-colors cursor-pointer">
            {service.title}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm flex items-center gap-1 mb-2">
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {service.location}
        </p>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
          {service.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-900 font-semibold text-sm">
            <span className="text-orange-500">
              <CurrencySymbol currency="AED" />
              {service.price_min.toLocaleString()}
            </span>{" "}
            - <CurrencySymbol currency="AED" />
            {service.price_max.toLocaleString()}
            <span className="text-gray-400 font-normal">
              {" "}
              / {service.price_unit}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
