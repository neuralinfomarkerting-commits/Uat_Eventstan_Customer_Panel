import { CheckCircle2 } from "lucide-react";
import Row from "./Row";
import Money from "./Money";

export default function SuccessScreen({
  checkoutId,
  currency,
  totalAmount,
  previousPaid,
  paidNow,
  onViewBooking,
  onViewHistory,
}: {
  checkoutId: string;
  currency: string;
  totalAmount: number;
  previousPaid: number;
  paidNow: number;
  onViewBooking: () => void;
  onViewHistory: () => void;
}) {
  return (
    <div className="max-w-sm mx-auto text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-green-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Payment Successful!
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Your remaining payment has been completed.
      </p>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 text-left space-y-2.5 mb-6">
        <Row label="Checkout ID" value={checkoutId} mono />
        <Row
          label="Total Amount"
          value={<Money value={totalAmount} currency={currency} />}
        />
        <Row
          label="Previous Paid"
          value={<Money value={previousPaid} currency={currency} />}
        />
        <Row
          label="Paid Now"
          value={<Money value={paidNow} currency={currency} />}
        />
        <div className="border-t border-gray-100 pt-2.5 flex items-center justify-between font-bold text-sm">
          <span className="text-gray-900">Total Paid</span>
          <Money value={totalAmount} currency={currency} />
        </div>
        <Row
          label="Remaining"
          value={<Money value={0} currency={currency} />}
        />
        <div className="flex items-center justify-between text-sm pt-1">
          <span className="text-gray-500">Payment Status</span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">
            Fully Paid
          </span>
        </div>
      </div>

      <button
        onClick={onViewBooking}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        View Booking
      </button>
      <button
        onClick={onViewHistory}
        className="w-full mt-2.5 border border-gray-200 hover:border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        View Payment Receipt
      </button>
    </div>
  );
}