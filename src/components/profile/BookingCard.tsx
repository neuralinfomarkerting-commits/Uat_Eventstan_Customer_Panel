"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  ApiBooking,
  BOOKING_STATUS_STYLES,
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_STYLES,
  PAYMENT_STATUS_LABELS,
  derivePaymentStatus,
} from "./types";

interface BookingCardProps {
  booking: ApiBooking;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const paid = booking.payments
    .filter(p => p.status === "SUCCEEDED")
    .reduce((sum, p) => sum + p.amount, 0);
  const paymentStatus = derivePaymentStatus(booking);
  const needsFullPayment = booking.status === "CONFIRMED" && paymentStatus === "PARTIALLY_PAID";

  return (
    <div className="border border-gray-100 rounded-xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
            {booking.items.map(item => item.title).join(", ")}
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm truncate">{booking.eventAddress}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${BOOKING_STATUS_STYLES[booking.status] ?? "bg-gray-100 text-gray-700"}`}>
            {BOOKING_STATUS_LABELS[booking.status] ?? booking.status.replaceAll("_", " ")}
          </span>
          <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${PAYMENT_STATUS_STYLES[paymentStatus] ?? "bg-gray-100 text-gray-700"}`}>
            {PAYMENT_STATUS_LABELS[paymentStatus] ?? paymentStatus.replaceAll("_", " ")}
          </span>
          <Link
            href={`/bookings/${booking.id}`}
            className="flex items-center gap-1 border border-gray-200 hover:border-orange-300 hover:text-orange-500 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full transition-colors"
          >
            View Details <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {needsFullPayment && (
        <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
          <span>⚠️</span>
          <span>Your booking is confirmed. Please pay the remaining amount before your event date.</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm border-t border-gray-100 pt-4">
        <div>
          <span className="text-gray-400 block mb-1">Booking ID</span>
          <span className="font-mono font-medium text-gray-900 truncate block">{booking.id}</span>
        </div>
        <div>
          <span className="text-gray-400 block mb-1">Event Date</span>
          <span className="font-medium text-gray-900">
            {booking.items[0] ? new Date(booking.items[0].eventDate).toLocaleDateString("en-GB") : "-"}
          </span>
        </div>
        <div>
          <span className="text-gray-400 block mb-1">Total</span>
          <span className="font-bold text-orange-500">{booking.currency} {booking.totalAmount.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-gray-400 block mb-1">Paid</span>
          <span className="font-bold text-green-600">{booking.currency} {paid.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
