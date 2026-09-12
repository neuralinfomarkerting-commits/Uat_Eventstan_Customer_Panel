import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { type RefundRecord } from "@/lib/mockBookings";
import Row from "./Row";
import Money from "./Money";

export default function RefundedScreen({
  checkoutId,
  currency,
  refund,
  onBack,
}: {
  checkoutId: string;
  currency: string;
  refund: RefundRecord;
  onBack: () => void;
}) {
  return (
    <div className="max-w-sm mx-auto text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-green-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Refund Requested</h2>
      <p className="text-gray-500 text-sm mb-6">
        We&apos;ve started processing your refund for{" "}
        <span className="font-mono text-gray-700">{checkoutId}</span>.
      </p>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 text-left space-y-2.5 mb-6">
        <Row label="Reference ID" value={refund.referenceId} mono />
        <Row
          label="Refund Amount"
          value={
            <Money
              value={refund.amount}
              currency={currency}
              className="text-green-600 font-semibold"
            />
          }
        />
        <Row label="Reason" value={refund.reason} />
        <Row label="Requested On" value={refund.date} />
        <Row label="Expected In" value="5–7 business days" />
        <div className="flex items-center justify-between text-sm pt-1">
          <span className="text-gray-500">Status</span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700">
            Processing
          </span>
        </div>
      </div>

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