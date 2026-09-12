import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { type PaymentRecord, type RefundRecord, type BookingItem } from "@/lib/mockBookings";
import DownloadReceiptButton from "@/components/receipt/DownloadReceiptButton";
import Money from "./Money";

export default function HistoryScreen({
  checkoutId,
  currency,
  totalAmount,
  paid,
  remaining,
  isFullyPaid,
  payments,
  refund,
  items,
  eventAddress,
  bookingDate,
  onBack,
}: {
  checkoutId: string;
  currency: string;
  totalAmount: number;
  paid: number;
  remaining: number;
  isFullyPaid: boolean;
  payments: PaymentRecord[];
  refund: RefundRecord | undefined;
  items: BookingItem[];
  eventAddress: string;
  bookingDate: string;
  onBack: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto">
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
            <span className="text-gray-600">Payment History</span>
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Payment History
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View all your payment transactions for this checkout.
          </p>
        </div>
        <button
          onClick={onBack}
          className="hidden sm:flex items-center gap-1.5 border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-300 hover:text-orange-500 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Booking
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono font-bold text-gray-900">{checkoutId}</p>
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
              refund
                ? "bg-gray-200 text-gray-700"
                : isFullyPaid
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
            }`}
          >
            {refund ? "Refunded" : isFullyPaid ? "Paid" : "Partial"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm border-b border-gray-100 pb-5 mb-5">
          <div>
            <span className="text-gray-400 block mb-1">Total Amount</span>
            <span className="font-bold text-gray-900">
              <Money value={totalAmount} currency={currency} />
            </span>
          </div>
          <div>
            <span className="text-gray-400 block mb-1">Total Paid</span>
            <span className="font-bold text-green-600">
              <Money value={paid} currency={currency} />
            </span>
          </div>
          <div>
            <span className="text-gray-400 block mb-1">Remaining Amount</span>
            <span className="font-bold text-orange-500">
              <Money value={remaining} currency={currency} />
            </span>
          </div>
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-3">
          Items in this Booking
        </h3>
        <div className="space-y-2 mb-5">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 border border-gray-100 rounded-xl p-3"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {item.title}
                </p>
                <p className="text-xs text-gray-400">{item.vendor}</p>
              </div>
              {item.quantity > 1 && (
                <span className="text-xs font-medium text-gray-500 flex-shrink-0">
                  x{item.quantity}
                </span>
              )}
            </div>
          ))}
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-3">
          Payment Transactions
        </h3>
        {payments.length === 0 && !refund && (
          <p className="text-sm text-gray-400 text-center py-6">
            No payments made yet.
          </p>
        )}
        <div className="space-y-3">
          {payments.map((payment, idx) => (
            <div
              key={payment.id}
              className="flex items-center gap-3 border border-gray-100 rounded-xl p-4"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={items[0]?.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">
                    Payment #{idx + 1}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
                    {payment.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{payment.date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900 text-sm">
                  <Money value={payment.amount} currency={currency} />
                </p>
                <span className="text-[10px] font-bold uppercase bg-green-100 text-green-700 rounded-full px-2 py-0.5">
                  {payment.status}
                </span>
              </div>
            </div>
          ))}

          {refund && (
            <div className="flex items-center gap-3 border border-gray-100 rounded-xl p-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-4.5 h-4.5 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">
                    Refund
                  </span>
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
                    {refund.reason}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{refund.date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900 text-sm flex items-center justify-end gap-1">
                  <span>-</span>
                  <Money value={refund.amount} currency={currency} />
                </p>
                <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">
                  Processing
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm font-bold border-t border-gray-100 mt-5 pt-4">
          <span className="text-gray-900">
            {refund ? "Total Refunded" : "Total Paid"}
          </span>
          <Money
            value={refund ? refund.amount : paid}
            currency={currency}
            className={refund ? "text-gray-700" : "text-green-600"}
          />
        </div>

        <DownloadReceiptButton
          checkoutId={checkoutId}
          currency={currency}
          totalAmount={totalAmount}
          paid={paid}
          remaining={remaining}
          isFullyPaid={isFullyPaid}
          payments={payments}
          refund={refund}
          items={items}
          eventAddress={eventAddress}
          bookingDate={bookingDate}
        />
      </div>
    </div>
  );
}