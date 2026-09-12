"use client";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import CurrencySymbol from "@/components/ui/CurrencySymbol";

export default function GatewayScreen({
  amount,
  currency,
  onSuccess,
  onFailure,
}: {
  amount: number;
  currency: string;
  onSuccess: () => void;
  onFailure: () => void;
}) {
  const [processing, setProcessing] = useState(false);

  const submit = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 900);
  };

  return (
    <div className="max-w-sm mx-auto text-center py-6">
      <div className="flex items-center justify-center gap-2 mb-5">
        <span className="text-[#635BFF] font-extrabold text-2xl italic tracking-tight">
          stripe
        </span>
        <span className="text-[10px] font-semibold text-gray-400 border border-gray-200 rounded-full px-2 py-0.5 uppercase tracking-wide">
          Test mode
        </span>
      </div>

      <p className="text-xs text-gray-400">Paying EventStan</p>
      <p className="flex items-baseline justify-center gap-1.5 text-3xl font-bold text-gray-900 mb-1 whitespace-nowrap">
        <CurrencySymbol
          currency={currency}
          className="text-xl leading-none flex-shrink-0"
        />
        <span>{amount.toLocaleString()}</span>
      </p>
      <p className="text-xs text-gray-400 mb-6">Checkout for booking payment</p>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-left">
        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
          Card information
        </label>
        <div className="mt-1.5 border border-gray-200 rounded-t-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#635BFF]/30 focus-within:border-[#635BFF]">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200">
            <span className="text-sm text-gray-400 font-mono">
              4242 4242 4242 4242
            </span>
            <span className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
              <span className="border border-gray-200 rounded px-1 py-0.5">
                VISA
              </span>
            </span>
          </div>
          <div className="flex">
            <div className="flex-1 px-3 py-2.5 border-r border-gray-200 text-sm text-gray-400">
              MM / YY
            </div>
            <div className="flex-1 px-3 py-2.5 text-sm text-gray-400">CVC</div>
          </div>
        </div>
        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mt-3 block">
          Cardholder name
        </label>
        <div className="mt-1.5 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400">
          Full name on card
        </div>

        <button
          onClick={submit}
          disabled={processing}
          className="w-full mt-4 bg-[#635BFF] hover:bg-[#5548e8] disabled:opacity-60 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          {processing
            ? "Processing..."
            : `Pay ${currency} ${amount.toLocaleString()}`}
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mt-4">
        <ShieldCheck className="w-3.5 h-3.5" /> Powered by Stripe · 256-bit SSL
        · PCI DSS Compliant
      </div>

      <button
        onClick={onFailure}
        className="text-xs text-gray-300 hover:text-gray-400 mt-4 underline"
      >
        Simulate failed payment
      </button>
    </div>
  );
}