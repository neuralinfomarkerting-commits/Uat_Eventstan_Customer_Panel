"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import CurrencySymbol from "@/components/ui/CurrencySymbol";

interface SharedCartItem {
  id: string;
  title: string;
  price: number;
  type: string;
  image_url?: string;
}

interface SharedCartPayload {
  name: string;
  email: string;
  note: string;
  items: SharedCartItem[];
  total: number;
}

export default function SharedCartPage() {
  const searchParams = useSearchParams();
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [payload, setPayload] = useState<SharedCartPayload | null>(null);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const encoded = searchParams.get("c");

  const decoded = useMemo<SharedCartPayload | null>(() => {
    if (typeof window !== "undefined" && params?.id) {
      try {
        const stored = window.localStorage.getItem(`shared-cart:${params.id}`);
        if (stored) return JSON.parse(stored) as SharedCartPayload;
      } catch {

      }
    }
    if (!encoded) return null;
    try {
      const json = decodeURIComponent(atob(encoded));
      return JSON.parse(json) as SharedCartPayload;
    } catch {
      return null;
    }
  }, [encoded, params?.id]);

  useEffect(() => {
    if (decoded) {
      setPayload(decoded);
    } else {
      setError("This share link looks invalid or has expired.");
    }
  }, [decoded]);

  const handleAddAll = () => {

    setAdded(true);
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium mb-1">Link not found</p>
        <p className="text-gray-400 text-sm mb-5">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-orange-600 transition-colors"
        >
          Browse Services
        </button>
      </div>
    );
  }

  if (!payload) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Browse Services
      </button>

      {}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-2 text-orange-600 text-xs font-bold tracking-wide mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          SHARED CART
        </div>
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">Event Selections</h1>
        {(payload.name || payload.email) && (
          <p className="text-sm text-gray-500 mb-4">
            Shared by <span className="font-semibold text-gray-700">{payload.name || "Someone"}</span>
            {payload.email && <> · {payload.email}</>}
          </p>
        )}
        {payload.note && (
          <div className="bg-white/70 rounded-xl px-4 py-3 text-sm text-gray-600 italic">
            &ldquo;{payload.note}&rdquo;
          </div>
        )}
      </div>

      {}
      <div className="space-y-3 mb-6">
        {payload.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              {item.image_url && item.image_url.trim() ? (
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-gray-900 truncate">{item.title}</p>
                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <p className="text-sm text-gray-400 capitalize">{item.type}</p>
            </div>
            <span className="text-orange-500 font-bold text-lg flex-shrink-0"><CurrencySymbol currency="AED" />{item.price.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {}
      <div className="flex items-center justify-between bg-orange-50 rounded-2xl px-6 py-4 mb-4">
        <span className="text-gray-900 font-bold">Estimated Total</span>
        <span className="text-orange-500 font-bold text-xl"><CurrencySymbol currency="AED" />{payload.total.toLocaleString()}</span>
      </div>

      {}
    </div>
  );
}