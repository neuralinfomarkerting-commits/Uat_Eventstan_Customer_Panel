import Link from "next/link";
import { Ban } from "lucide-react";
import Money from "./Money";
import Row from "./Row";

export default function CancelledScreen({
  checkoutId,
  currency,
  paid,
  onBack,
}: {
  checkoutId: string;
  currency: string;
  paid: number;
  onBack: () => void;
}) {
  return (
    <div className="max-w-sm mx-auto text-center py-10">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Ban className="w-8 h-8 text-gray-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Booking Cancelled
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        <span className="font-mono text-gray-700">{checkoutId}</span> has been
        cancelled.
        {paid > 0 && " A refund for your paid amount has been initiated."}
      </p>

      {paid > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 text-left space-y-2.5 mb-6">
          <Row
            label="Refund Amount"
            value={
              <Money
                value={paid}
                currency={currency}
                className="text-green-600 font-semibold"
              />
            }
          />
          <Row label="Expected In" value="5–7 business days" />
          <div className="flex items-center justify-between text-sm pt-1">
            <span className="text-gray-500">Status</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700">
              Processing
            </span>
          </div>
        </div>
      )}

      <Link
        href="/bookings"
        className="w-full block bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        Back to My Bookings
      </Link>
      <button
        onClick={onBack}
        className="w-full mt-2.5 border border-gray-200 hover:border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        View Booking Details
      </button>
    </div>
  );
}