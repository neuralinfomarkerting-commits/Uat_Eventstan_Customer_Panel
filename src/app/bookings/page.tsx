"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { customerApi } from "@/api/customerApi";
import { useAuth } from "@/lib/AuthContext";
import { ChevronRight, ImageOff } from "lucide-react";
import {
  Booking,
  BookingStatus,
  STATUS_STYLES,
  STATUS_LABELS,
  PAYMENT_STATUS_STYLES,
  PAYMENT_STATUS_LABELS,
  STATIC_BOOKINGS,
  mapMyBookingToBooking,
} from "@/lib/mockBookings";

type FilterKey = "ALL" | BookingStatus;
const formatDateDDMMYYYY = (value?: string) => {
  if (!value) return "-";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  const [, yyyy, mm, dd] = match;
  return `${dd}-${mm}-${yyyy}`;
};

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("ALL");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/auth/login?redirect=/bookings");
      return;
    }
    customerApi.bookings
      .list(user.id)
      .then((result) => {
        const list = Array.isArray(result)
          ? result.map(mapMyBookingToBooking)
          : [];
        setBookings(list.length > 0 ? list : STATIC_BOOKINGS);
      })
      .catch(() => {
        setBookings(STATIC_BOOKINGS);
      })
      .finally(() => setLoading(false));
  }, [authLoading, router, user]);

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
        Loading your bookings...
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No Bookings Yet
        </h2>
        <p className="text-gray-500 mb-6">
          Browse services and make your first booking.
        </p>
        <Link
          href="/services"
          className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600"
        >
          Browse Services
        </Link>
      </div>
    );
  }

  const counts = {
    ALL: bookings.length,
    IN_PROCESS: bookings.filter((b) => b.status === "IN_PROCESS").length,
    CONFIRMED: bookings.filter((b) => b.status === "CONFIRMED").length,
    COMPLETED: bookings.filter((b) => b.status === "COMPLETED").length,
    CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  const filters: { key: FilterKey; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "IN_PROCESS", label: "In Process" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "COMPLETED", label: "Completed" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  const filteredBookings =
    filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 overflow-x-hidden">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors flex-shrink-0 whitespace-nowrap ${
              filter === key
                ? "bg-orange-500 border-orange-500 text-white"
                : "bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500"
            }`}
          >
            {label}
            <span
              className={`text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center ${
                filter === key
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No bookings found in this category.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const paid = booking.payments
              .filter((payment) => payment.status === "SUCCEEDED")
              .reduce((sum, payment) => sum + payment.amount, 0);
            const needsFullPayment =
              booking.status === "CONFIRMED" &&
              booking.paymentStatus === "PARTIALLY_PAID";
            return (
              <div
                key={booking.id}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 hover:border-orange-200 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="flex flex-row gap-4">
                  {booking.items[0]?.image ? (
                    <img
                      src={booking.items[0].image}
                      alt={booking.items[0]?.title ?? "Booking"}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <ImageOff className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug mb-1">
                      {booking.items[0]?.title ?? "Booking"}
                    </h3>
                    {booking.items.length > 1 && (
                      <span className="inline-block text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-2 py-0.5 mb-1">
                        +{booking.items.length - 1} more
                      </span>
                    )}
                    <p className="text-gray-500 text-sm mb-2 truncate">
                      {booking.eventAddress}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[booking.status] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {STATUS_LABELS[booking.status] ??
                          booking.status.replaceAll("_", " ")}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold ${PAYMENT_STATUS_STYLES[booking.paymentStatus] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {PAYMENT_STATUS_LABELS[booking.paymentStatus] ??
                          booking.paymentStatus.replaceAll("_", " ")}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/bookings/${booking.id}`}
                    target="_blank"
                    className="hidden sm:flex items-center gap-1 self-start border border-gray-200 hover:border-orange-300 hover:text-orange-500 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full transition-colors flex-shrink-0"
                  >
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {needsFullPayment && (
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3">
                    <span>⚠️</span>
                    <span>
                      Your booking is confirmed. Please pay the remaining amount
                      before your event date.
                    </span>
                  </div>
                )}

                {booking.items.length > 1 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {booking.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1"
                      >
                        {item.title}
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-4 text-xs sm:text-sm border-t border-gray-100 mt-4 pt-4">
                  <div className="min-w-0">
                    <span className="text-gray-400 block mb-1">Booking ID</span>
                    <span
                      className="font-mono font-medium text-gray-900 truncate block"
                      title={booking.id}
                    >
                      {booking.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Packages</span>
                    <span className="font-medium text-gray-900">
                      {booking.items.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Booking Date</span>
                    <span className="font-medium text-gray-900">
                      {formatDateDDMMYYYY(booking.bookingDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Event Date</span>
                    <span className="font-medium text-gray-900">
                      {formatDateDDMMYYYY(booking.items[0]?.eventDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Total</span>
                    <span className="font-bold text-orange-500">
                      {booking.currency} {booking.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Paid</span>
                    <span className="font-bold text-green-600">
                      {booking.currency} {paid.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/bookings/${booking.id}`}
                  target="_blank"
                  className="sm:hidden mt-4 flex items-center justify-center gap-1 border border-gray-200 hover:border-orange-300 hover:text-orange-500 text-gray-700 text-sm font-semibold py-2.5 rounded-full transition-colors"
                >
                  View Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}