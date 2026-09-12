import { RotateCcw } from "lucide-react";
import Money from "./Money";
import Row from "./Row";

const REFUND_REASONS = [
  "Change of plans",
  "Found a better vendor",
  "Event postponed",
  "Booked by mistake",
  "Other",
];

export default function RefundScreen({
  checkoutId,
  currency,
  paid,
  reason,
  setReason,
  refunding,
  onConfirm,
  onBack,
}: {
  checkoutId: string;
  currency: string;
  paid: number;
  reason: string;
  setReason: (r: string) => void;
  refunding: boolean;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <div className="max-w-sm mx-auto py-8">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <RotateCcw className="w-7 h-7 text-orange-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Request a Refund
        </h2>
        <p className="text-gray-500 text-sm">
          <span className="font-mono text-gray-700">{checkoutId}</span> is fully
          paid. Tell us why you&apos;d like a refund.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-5">
        <Row
          label="Amount Paid"
          value={
            <Money
              value={paid}
              currency={currency}
              className="text-gray-900 font-semibold"
            />
          }
        />
        <Row
          label="Refundable Amount"
          value={
            <Money
              value={paid}
              currency={currency}
              className="text-green-600 font-semibold"
            />
          }
        />
      </div>

      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
        Reason for refund
      </label>
      <div className="space-y-2 mb-6">
        {REFUND_REASONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setReason(option)}
            className={`w-full flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm text-left transition-colors ${
              reason === option
                ? "border-orange-400 bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                reason === option ? "border-orange-500" : "border-gray-300"
              }`}
            >
              {reason === option && (
                <span className="w-2 h-2 rounded-full bg-orange-500" />
              )}
            </span>
            <span className="font-medium text-gray-800">{option}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onConfirm}
        disabled={refunding}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        {refunding ? "Submitting..." : "Submit Refund Request"}
      </button>
      <button
        onClick={onBack}
        className="w-full mt-2.5 border border-gray-200 hover:border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}