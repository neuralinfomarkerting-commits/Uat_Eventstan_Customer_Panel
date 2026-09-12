"use client";

import { useState } from "react";
import { ApiBooking, BOOKING_STATUS_LABELS } from "./types";
import BookingCard from "./BookingCard";

interface BookingsTabProps {
  bookings: ApiBooking[];
  loading: boolean;
  error: string;
}

type FilterKey = "ALL" | "IN_PROCESS" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export default function BookingsTab({ bookings, loading, error }: BookingsTabProps) {
  const [filter, setFilter] = useState<FilterKey>("ALL");

  const counts = {
    ALL: bookings.length,
    IN_PROCESS: bookings.filter((b) => b.status === "IN_PROCESS").length,
    CONFIRMED: bookings.filter((b) => b.status === "CONFIRMED").length,
    COMPLETED: bookings.filter((b) => b.status === "COMPLETED").length,
    CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  const filters: { key: FilterKey; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "IN_PROCESS", label: BOOKING_STATUS_LABELS.IN_PROCESS ?? "In Process" },
    { key: "CONFIRMED", label: BOOKING_STATUS_LABELS.CONFIRMED ?? "Confirmed" },
    { key: "COMPLETED", label: BOOKING_STATUS_LABELS.COMPLETED ?? "Completed" },
    { key: "CANCELLED", label: BOOKING_STATUS_LABELS.CANCELLED ?? "Cancelled" },
  ];

  const filteredBookings = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 sm:px-8 py-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">My Bookings</h2>

      {!loading && !error && bookings.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-colors ${
                filter === key
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500"
              }`}
            >
              {label}
              <span
                className={`text-[10px] sm:text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[1.1rem] text-center ${
                  filter === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {counts[key]}
              </span>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 sm:py-16 text-gray-500 text-sm">Loading your bookings...</div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <svg className="w-14 h-14 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p className="font-medium text-gray-500">No bookings yet</p>
          <p className="text-sm mt-1 text-gray-400">Your event bookings will appear here.</p>
          <a href="/services" className="inline-block mt-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            Browse Services
          </a>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && filteredBookings.length === 0 && (
        <div className="text-center py-12 sm:py-16 text-gray-400 text-sm">
          No bookings found in this category.
        </div>
      )}

      {!loading && !error && filteredBookings.length > 0 && (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
