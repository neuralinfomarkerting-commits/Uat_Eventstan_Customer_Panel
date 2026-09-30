import Link from "next/link";
import { ArrowLeft, CheckCircle2, ImageOff, Lock, ShieldCheck } from "lucide-react";
import CurrencySymbol from "@/components/ui/CurrencySymbol";
import { type Booking } from "@/lib/mockBookings";
import Money from "./Money";

export default function PayScreen({
  booking,
  currency,
  totalAmount,
  paid,
  remaining,
  onBack,
  onPay,
}: {
  booking: Booking;
  currency: string;
  totalAmount: number;
  paid: number;
  remaining: number;
  onBack: () => void;
  onPay: () => void;
}) {
  const paidPercent =
    totalAmount > 0 ? Math.min(100, Math.max(0, Math.round((paid / totalAmount) * 100))) : 0;

  const payButtonClass =
    "w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2";

  return (
    <div className="pb-24 lg:pb-0">
      <div className="flex items-start justify-between gap-4">
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
            Review the amount due. You can choose your payment method securely on the next step.
          </p>
        </div>
        <button
          onClick={onBack}
          className="hidden sm:flex items-center gap-1.5 border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-300 hover:text-orange-500 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Booking
        </button>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-5 mt-6 items-start">
        {/* Amount due: first on mobile, sticky on the right on desktop */}
        <aside className="order-first lg:order-none lg:col-start-2 lg:row-start-1 lg:sticky lg:top-24 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 bg-orange-50/70 border-b border-orange-100">
            <p className="text-sm text-gray-600">Amount due now</p>
            <p className="flex items-baseline gap-2 mt-1 font-bold text-orange-500 whitespace-nowrap tabular-nums">
              <CurrencySymbol currency={currency} className="text-xl leading-none flex-shrink-0" />
              <span className="text-4xl sm:text-5xl leading-none">{remaining.toLocaleString()}</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              This clears your booking balance in full.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <button onClick={onPay} className={`${payButtonClass} hidden lg:flex`}>
              <Lock className="w-4 h-4" />
              <span>Pay</span>
              <Money value={remaining} currency={currency} />
            </button>
            <p className="flex items-start gap-2 text-xs text-gray-500 lg:mt-4 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-px" />
              <span>
                Payments are processed securely by Stripe. You&apos;ll pick how to pay on the next screen, and
                your card details never touch our servers.
              </span>
            </p>
          </div>
        </aside>

        {/* Order summary */}
        <section className="lg:col-start-1 lg:row-start-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <div>
              <p className="text-xs text-gray-400">Booking</p>
              <p className="font-mono font-bold text-gray-900 break-all">{booking.bookingId}</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1">
              Payment pending
            </span>
          </div>

          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            What you&apos;re paying for
          </h2>
          <ul className="divide-y divide-gray-100 border-y border-gray-100">
            {booking.items.map((pkg) => (
              <li key={pkg.bookingId} className="flex items-center gap-3.5 py-3.5">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                  {pkg.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pkg.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageOff className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{pkg.title}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {pkg.vendor}
                    {pkg.quantity > 1 ? ` (x${pkg.quantity})` : ""}
                  </p>
                </div>
                <Money
                  value={pkg.amount}
                  currency={currency}
                  className="text-sm font-semibold text-gray-900 tabular-nums"
                />
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Total amount</dt>
              <dd className="font-semibold text-gray-900 tabular-nums">
                <Money value={totalAmount} currency={currency} />
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1.5 text-gray-500">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Already paid
              </dt>
              <dd className="font-semibold text-green-600 tabular-nums">
                <Money value={paid} currency={currency} />
              </dd>
            </div>
          </dl>

          <div className="mt-4">
            <div
              className="h-2 rounded-full bg-gray-100 overflow-hidden"
              role="progressbar"
              aria-valuenow={paidPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Portion of the total already paid"
            >
              <div
                className="h-full rounded-full bg-green-500 transition-[width] duration-500"
                style={{ width: `${paidPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{paidPercent}% paid</p>
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            <span className="text-sm font-bold text-gray-900">Remaining amount</span>
            <Money
              value={remaining}
              currency={currency}
              className="text-lg font-bold text-orange-500 tabular-nums"
            />
          </div>
        </section>
      </div>

      {/* Mobile: pay bar stays reachable while scrolling */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur border-t border-gray-100 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button onClick={onPay} className={payButtonClass}>
          <Lock className="w-4 h-4" />
          <span>Pay</span>
          <Money value={remaining} currency={currency} />
        </button>
      </div>
    </div>
  );
}