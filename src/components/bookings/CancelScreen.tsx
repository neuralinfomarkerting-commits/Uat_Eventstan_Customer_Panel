import { Ban } from "lucide-react";
import Money from "./Money";

export default function CancelScreen({
  checkoutId,
  currency,
  paid,
  cancelling,
  onConfirm,
  onBack,
}: {
  checkoutId: string;
  currency: string;
  paid: number;
  cancelling: boolean;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <div className="max-w-sm mx-auto text-center py-10">
      <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Ban className="w-7 h-7 text-red-500" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">
        Cancel this booking?
      </h2>
      <p className="text-gray-500 text-sm mb-5">
        This will cancel{" "}
        <span className="font-mono text-gray-700">{checkoutId}</span> and notify
        your vendors. This action can&apos;t be undone.
      </p>

      {paid > 0 && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-left mb-6">
          <p className="text-xs text-gray-500">
            You&apos;ve already paid{" "}
            <span className="font-semibold text-gray-900">
              <Money value={paid} currency={currency} />
            </span>
            . This amount will be automatically refunded to your original
            payment method within 5–7 business days, minus any applicable
            cancellation fee.
          </p>
        </div>
      )}

      <button
        onClick={onConfirm}
        disabled={cancelling}
        className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        {cancelling ? "Cancelling..." : "Yes, Cancel Booking"}
      </button>
      <button
        onClick={onBack}
        className="w-full mt-2.5 border border-gray-200 hover:border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        Keep Booking
      </button>
    </div>
  );
}