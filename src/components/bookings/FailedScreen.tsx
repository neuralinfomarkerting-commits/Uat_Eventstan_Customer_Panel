import { XCircle, Ban } from "lucide-react";
import Money from "./Money";

export default function FailedScreen({
  amount,
  currency,
  onRetry,
  onBack,
  onCancel,
}: {
  amount: number;
  currency: string;
  onRetry: () => void;
  onBack: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="max-w-sm mx-auto text-center py-10">
      <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle className="w-7 h-7 text-red-500" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Payment Failed</h2>
      <p className="text-gray-500 text-sm mb-6">
        Your payment of <Money value={amount} currency={currency} /> could
        not be completed. You can try again, or cancel this booking if you no
        longer wish to proceed before the event.
      </p>
      <button
        onClick={onRetry}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        Try Again
      </button>
      <button
        onClick={onBack}
        className="w-full mt-2.5 border border-gray-200 hover:border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        Back to Booking
      </button>
      <button
        onClick={onCancel}
        className="w-full mt-2.5 flex items-center justify-center gap-1.5 text-red-500 hover:text-red-600 py-2.5 rounded-xl font-semibold text-sm transition-colors"
      >
        <Ban className="w-4 h-4" /> Cancel Booking Instead
      </button>
    </div>
  );
}