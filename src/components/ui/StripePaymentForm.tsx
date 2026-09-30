"use client";
import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { ShieldCheck } from "lucide-react";
import { getStripe } from "@/lib/stripeClient";
import CurrencySymbol from "@/components/ui/CurrencySymbol";

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (message: string) => void;
}

function InnerForm({ amount, currency, onSuccess, onError }: Omit<StripePaymentFormProps, "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    setMessage("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message ?? "Payment failed. Please try again.");
      onError(error.message ?? "Payment failed. Please try again.");
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
      return;
    }

    setMessage("Payment could not be completed. Please try a different card.");
    onError("Payment could not be completed.");
    setProcessing(false);
  };

  return (
    <div>
      <p className="text-xs text-gray-400">Paying EventStan</p>
      <p className="flex items-baseline justify-center gap-1.5 text-3xl font-bold text-gray-900 mb-1 whitespace-nowrap [font-variant-ligatures:none] tracking-normal">
        <CurrencySymbol currency={currency} className="text-xl leading-none flex-shrink-0 [font-variant-ligatures:none]" />
        <span className="tabular-nums">{amount.toLocaleString()}</span>
      </p>
      <p className="text-xs text-gray-400 mb-6">Checkout for booking payment</p>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-left">
        <PaymentElement
          options={{
            layout: "tabs",
            defaultValues: {
              billingDetails: { address: { country: "AE" } },
            },
          }}
        />
        {message && <p className="text-xs text-red-500 mt-3">{message}</p>}

        <button
          onClick={handleSubmit}
          disabled={processing || !stripe || !elements}
          className="w-full mt-4 bg-[#635BFF] hover:bg-[#5548e8] disabled:opacity-60 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          {processing ? "Processing..." : `Pay ${currency} ${amount.toLocaleString()}`}
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mt-4">
        <ShieldCheck className="w-3.5 h-3.5" /> Powered by Stripe · 256-bit SSL · PCI DSS Compliant
      </div>
    </div>
  );
}

export default function StripePaymentForm({
  clientSecret,
  amount,
  currency,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: { colorPrimary: "#635BFF", borderRadius: "8px" },
        },
      }}
    >
      <InnerForm amount={amount} currency={currency} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}