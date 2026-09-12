import Link from "next/link";
import { ArrowLeft, ChevronRight, AlertTriangle, XCircle, Ban, RotateCcw, ImageOff } from "lucide-react";
import {
  STATUS_STYLES,
  STATUS_LABELS,
  PAYMENT_STATUS_STYLES,
  PAYMENT_STATUS_LABELS,
  type Booking,
  type BookingStatus,
  type PaymentStatus,
  type RefundRecord,
} from "@/lib/mockBookings";
import Row from "./Row";
import Money from "./Money";

const formatDateDDMMYYYY = (value?: string) => {
  if (!value) return "-";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  const [, yyyy, mm, dd] = match;
  return `${dd}-${mm}-${yyyy}`;
};

export default function DetailsScreen({
  booking,
  currency,
  totalAmount,
  paid,
  remaining,
  percentPaid,
  isFullyPaid,
  status,
  paymentStatus,
  isTerminal,
  refund,
  onPayRemaining,
  onViewHistory,
  onCancelBooking,
}: {
  booking: Booking;
  currency: string;
  totalAmount: number;
  paid: number;
  remaining: number;
  percentPaid: number;
  isFullyPaid: boolean;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  isTerminal: boolean;
  refund: RefundRecord | undefined;
  onPayRemaining: () => void;
  onViewHistory: () => void;
  onCancelBooking: () => void;
}) {
  const statusStyle = STATUS_STYLES[status];
  const statusLabel = STATUS_LABELS[status];
  const paymentStatusLabel = PAYMENT_STATUS_LABELS[paymentStatus];
  const paymentStatusClass = PAYMENT_STATUS_STYLES[paymentStatus];
  const needsFullPayment =
    status === "CONFIRMED" && paymentStatus === "PARTIALLY_PAID";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-xs text-gray-400 mb-1">
            <Link href="/bookings" className="hover:text-orange-500">
              My Bookings
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-gray-600">Booking Details</span>
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Booking Details
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here&apos;s everything about your selected checkout.
          </p>
        </div>
        <Link
          href="/bookings"
          className="hidden sm:flex items-center gap-1.5 border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-300 hover:text-orange-500 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Bookings
        </Link>
      </div>

      {needsFullPayment && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3.5 mt-5">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800">
              Your booking is confirmed
            </p>
            <p className="text-amber-700 mt-0.5">
              You&apos;ve paid {percentPaid}% so far. Please pay the remaining
              amount before your event date to complete this booking.
            </p>
          </div>
        </div>
      )}

      {paymentStatus === "FAILED" && !isTerminal && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3.5 mt-5">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-700">
              Your last payment failed
            </p>
            <p className="text-red-600 mt-0.5">
              Please retry the payment to confirm this booking.
            </p>
          </div>
        </div>
      )}

      {status === "CANCELLED" && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3.5 mt-5">
          <Ban className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-700">
              This booking has been cancelled
            </p>
            {paid > 0 && (
              <p className="text-red-600 mt-0.5">
                A refund of <Money value={paid} currency={currency} /> has
                been initiated to your original payment method.
              </p>
            )}
          </div>
        </div>
      )}

      {paymentStatus === "REFUNDED" && refund && (
        <div className="flex items-start gap-3 bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3.5 mt-5">
          <RotateCcw className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-gray-800">Refund completed</p>
            <p className="text-gray-600 mt-0.5">
              <Money value={refund.amount} currency={currency} /> was
              refunded on {refund.date}. Reference:{" "}
              <span className="font-mono">{refund.referenceId}</span>
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <span className="text-[11px] font-bold text-orange-500 uppercase tracking-wide">
                Checkout ID
              </span>
              <p className="font-mono font-bold text-gray-900 text-lg">
                {booking.id}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${statusStyle}`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-500 mt-3 mb-5 border-b border-gray-100 pb-5">
            <span>
              Booking Date{" "}
              <span className="text-gray-900 font-medium ml-1">
                {formatDateDDMMYYYY(booking.bookingDate)}
              </span>
            </span>
            <span>
              Total Packages{" "}
              <span className="text-gray-900 font-medium ml-1">
                {booking.items.length}
              </span>
            </span>
            <span>
              Total Amount{" "}
              <span className="text-gray-900 font-medium ml-1">
                <Money value={totalAmount} currency={currency} />
              </span>
            </span>
          </div>

          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Packages in this Checkout
          </h3>
          <div className="space-y-3">
            {booking.items.map((pkg) => (
              <div
                key={pkg.bookingId}
                className="flex flex-wrap sm:flex-nowrap items-center gap-3 border border-gray-100 rounded-xl p-3"
              >
                {pkg.image ? (
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                    <ImageOff className="w-5 h-5 text-gray-300" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-orange-500 font-semibold">
                      {pkg.bookingId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${statusStyle}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {pkg.title}
                  </p>
                  <p className="text-xs text-gray-400">{pkg.vendor}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-gray-500 mt-1">
                    <span>{formatDateDDMMYYYY(pkg.eventDate)}</span>
                    <span>{pkg.eventTime}</span>
                    <span>{pkg.guests} Guests</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">Amount</p>
                    <p className="font-bold text-gray-900 text-sm">
                      <Money value={pkg.amount} currency={currency} />
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Payment Summary</h3>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${paymentStatusClass}`}
            >
              {paymentStatusLabel}
            </span>
          </div>

          <div className="space-y-2.5 text-sm">
            <Row
              label="Payment Type"
              value={isFullyPaid ? "FULL" : paid > 0 ? "PARTIAL" : "—"}
            />
            <Row label="Payment Percentage" value={`${percentPaid}%`} />
            <Row
              label="Total Amount"
              value={<Money value={totalAmount} currency={currency} />}
            />
            <Row
              label="Amount Paid"
              value={
                <Money
                  value={paid}
                  currency={currency}
                  className="text-green-600 font-semibold"
                />
              }
            />
            <Row
              label="Remaining Amount"
              value={
                <Money
                  value={remaining}
                  currency={currency}
                  className="text-orange-500 font-semibold"
                />
              }
            />
            <Row label="Currency" value={currency} />
            <Row
              label="Payment Status"
              value={paymentStatusLabel.replaceAll(" ", "_")}
            />
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>{percentPaid}% Paid</span>
              <span>
                <Money value={paid} currency={currency} /> of{" "}
                <Money value={totalAmount} currency={currency} />
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isTerminal ? "bg-gray-300" : "bg-orange-500"}`}
                style={{ width: `${percentPaid}%` }}
              />
            </div>
          </div>

          {!isTerminal && !isFullyPaid && (
            <button
              onClick={onPayRemaining}
              className="w-full mt-5 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              <span>Pay Remaining</span>
              <Money value={remaining} currency={currency} />
            </button>
          )}

          {paid > 0 && (
            <button
              onClick={onViewHistory}
              className="w-full mt-2.5 border border-gray-200 hover:border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              View Payment History
            </button>
          )}
        </div>
      </div>
    </div>
  );
}