"use client";
import { useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import CurrencySymbol from "@/components/ui/CurrencySymbol";

interface StripeGatewayModalProps {
  amount: number;
  currency: string;
  clientSecret: string | null;
  loadingIntent?: boolean;
  intentError?: string | null;
  processing: boolean;
  onSuccess: (paymentIntentId: string) => void;
  onError: (message: string) => void;
  onClose: () => void;
}

function GatewayForm({
  amount,
  currency,
  processing,
  onSuccess,
  onError,
  onClose,
}: Omit<StripeGatewayModalProps, "clientSecret" | "loadingIntent" | "intentError">) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setFormError(null);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    setSubmitting(false);

    if (error) {
      const msg = error.message ?? "Payment failed. Please check your card details.";
      setFormError(msg);
      onError(msg);
      return;
    }
    if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent.id);
      return;
    }
    const msg = `Payment not completed (status: ${paymentIntent?.status ?? "unknown"}).`;
    setFormError(msg);
    onError(msg);
  };

  const busy = processing || submitting;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-left">
        <PaymentElement options={{ layout: "tabs" }} />
        <button
          onClick={handlePay}
          disabled={busy || !stripe || !elements}
          className="w-full mt-4 bg-[#635BFF] hover:bg-[#5548e8] disabled:opacity-60 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          {busy ? "Processing..." : `Pay ${currency} ${amount.toLocaleString()}`}
        </button>
      </div>
      {formError && (
        <p className="mt-3 text-xs text-red-500 text-left">{formError}</p>
      )}
      <p className="mt-3 text-[11px] text-gray-400 text-left">
        Test mode — use card <span className="font-mono">4242 4242 4242 4242</span>,
        any future expiry, any CVC.
      </p>
    </>
  );
}

export default function StripeGatewayModal({
  amount,
  currency,
  clientSecret,
  loadingIntent = false,
  intentError = null,
  processing,
  onSuccess,
  onError,
  onClose,
}: StripeGatewayModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 text-center">
        <button
          onClick={onClose}
          disabled={processing}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="text-[#635BFF] font-extrabold text-2xl italic tracking-tight">stripe</span>
          <span className="text-[10px] font-semibold text-gray-400 border border-gray-200 rounded-full px-2 py-0.5 uppercase tracking-wide">
            Test mode
          </span>
        </div>

        <p className="text-xs text-gray-400">Paying EventStan</p>
        <p className="flex items-baseline justify-center gap-1.5 text-3xl font-bold text-gray-900 mb-1 whitespace-nowrap">
          <CurrencySymbol currency={currency} className="text-xl leading-none flex-shrink-0" />
          <span className="tabular-nums">{amount.toLocaleString()}</span>
        </p>
        <p className="text-xs text-gray-400 mb-6">Checkout for booking payment</p>

        {loadingIntent && (
          <p className="text-sm text-gray-400 py-8">Setting up secure payment…</p>
        )}

        {!loadingIntent && intentError && (
          <p className="text-sm text-red-500 py-8">{intentError}</p>
        )}

        {!loadingIntent && !intentError && clientSecret && (
          <Elements
            stripe={getStripe()}
            options={{ clientSecret, appearance: { theme: "stripe" } }}
          >
            <GatewayForm
              amount={amount}
              currency={currency}
              processing={processing}
              onSuccess={onSuccess}
              onError={onError}
              onClose={onClose}
            />
          </Elements>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mt-4">
          <ShieldCheck className="w-3.5 h-3.5" /> Powered by Stripe · 256-bit SSL · PCI DSS Compliant
        </div>
      </div>
    </div>
  );
}