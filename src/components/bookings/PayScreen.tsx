import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import CurrencySymbol from "@/components/ui/CurrencySymbol";
import { type Booking } from "@/lib/mockBookings";
import Money from "./Money";

type PaymentMethod = "card" | "apple" | "google" | "other";

export default function PayScreen({
  booking,
  currency,
  totalAmount,
  paid,
  remaining,
  method,
  setMethod,
  onBack,
  onPay,
}: {
  booking: Booking;
  currency: string;
  totalAmount: number;
  paid: number;
  remaining: number;
  method: PaymentMethod;
  setMethod: (m: PaymentMethod) => void;
  onBack: () => void;
  onPay: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-xs text-gray-400 mb-1">
            <Link href="/bookings" className="hover:text-orange-500">
              My Bookings
            </Link>
            <span className="mx-1.5">/</span>
            <button onClick={onBack} className="hover:text-orange-500">
              Booking Details
            </button>
            <span className="mx-1.5">/</span>
            <span className="text-gray-600">Pay Remaining</span>
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Complete Your Payment
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review the amount due and choose how you&apos;d like to pay.
          </p>
        </div>
        <button
          onClick={onBack}
          className="hidden sm:flex items-center gap-1.5 border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-300 hover:text-orange-500 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Booking
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <p className="font-mono font-bold text-gray-900 mb-4">{booking.id}</p>

          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase tracking-wide border-b border-gray-100 pb-2 mb-2">
            <span>Packages</span>
            <span>Amount ({currency})</span>
          </div>
          <div className="space-y-2 mb-4">
            {booking.items.map((pkg) => (
              <div
                key={pkg.bookingId}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700">{pkg.title}</span>
                <span className="font-medium text-gray-900">
                  <Money value={pkg.amount} currency={currency} />
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm font-bold border-t border-gray-100 pt-3 mb-4">
            <span className="text-gray-900">Total Amount</span>
            <Money value={totalAmount} currency={currency} />
          </div>

          <div className="bg-orange-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Already Paid</span>
              <span className="font-semibold text-gray-900 flex items-center gap-1">
                <span>-</span>
                <Money value={paid} currency={currency} />
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-gray-900">Remaining Amount</span>
              <Money
                value={remaining}
                currency={currency}
                className="text-orange-500"
              />
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm text-gray-500 mb-1">Amount to Pay</p>
            <p className="flex items-baseline gap-1.5 text-3xl font-bold text-orange-500 whitespace-nowrap">
              <CurrencySymbol
                currency={currency}
                className="text-xl leading-none flex-shrink-0"
              />
              <span>{remaining.toLocaleString()}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              This is the remaining amount to be paid.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 h-fit">
          <h3 className="text-sm font-bold text-gray-900 mb-4">
            Choose Payment Method
          </h3>
          <div className="space-y-2.5">
            <PaymentMethodOption
              label="Card"
              badge="VISA · Mastercard · AMEX"
              selected={method === "card"}
              onSelect={() => setMethod("card")}
            />
            <PaymentMethodOption
              label="Apple Pay"
              badge="Pay"
              selected={method === "apple"}
              onSelect={() => setMethod("apple")}
            />
            <PaymentMethodOption
              label="Google Pay"
              badge="G Pay"
              selected={method === "google"}
              onSelect={() => setMethod("google")}
            />
            <PaymentMethodOption
              label="Other UPI / Wallet"
              selected={method === "other"}
              onSelect={() => setMethod("other")}
            />
          </div>

          <button
            onClick={onPay}
            className="w-full mt-5 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            <Lock className="w-4 h-4" />
            <span>Pay</span>
            <Money value={remaining} currency={currency} />
          </button>
          <p className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-2.5">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure Payment via
            Stripe
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodOption({
  label,
  badge,
  selected,
  onSelect,
}: {
  label: string;
  badge?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-3 text-sm transition-colors ${
        selected
          ? "border-orange-400 bg-orange-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span
          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
            selected ? "border-orange-500" : "border-gray-300"
          }`}
        >
          {selected && <span className="w-2 h-2 rounded-full bg-orange-500" />}
        </span>
        <span className="font-medium text-gray-800">{label}</span>
      </span>
      {badge && (
        <span className="text-[10px] text-gray-400 flex-shrink-0">{badge}</span>
      )}
    </button>
  );
}