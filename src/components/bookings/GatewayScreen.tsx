"use client";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { customerApi } from "@/api/customerApi";
import StripePaymentForm from "@/components/ui/StripePaymentForm";

export default function GatewayScreen({
  bookingId,
  bookingIds,
  amount,
  currency,
  onSuccess,
  onFailure,
}: {
  bookingId: string;
  bookingIds?: string[];
  amount: number;
  currency: string;
  onSuccess: () => void;
  onFailure: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(true);
  const [intentError, setIntentError] = useState("");
  const paymentIdByIntent = useRef<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    const createIntent = async () => {
      setLoadingIntent(true);
      setIntentError("");
      try {
        const core = await customerApi.bookings.resolveCore([bookingId, ...(bookingIds ?? [])]);
        if (!core) throw new Error("Booking not found");
        const res = await customerApi.payments.createIntent({
          bookingId: core.id,
          paymentType: "REMAINING",
        });
        if (res.id && res.paymentIntentId) {
          paymentIdByIntent.current[res.paymentIntentId] = res.id;
        }
        if (cancelled) return;
        if (!res.clientSecret) {
          throw new Error("Payment gateway did not return a client secret.");
        }
        setClientSecret(res.clientSecret);
      } catch (cause) {
        if (cancelled) return;
        const msg =
          cause instanceof Error ? cause.message : "Could not start payment. Please try again.";
        setIntentError(msg);
      } finally {
        if (!cancelled) setLoadingIntent(false);
      }
    };

    createIntent();
    return () => {
      cancelled = true;
    };
  }, [bookingId, bookingIds]);
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      await customerApi.payments.verify(
        paymentIdByIntent.current[paymentIntentId] ?? paymentIntentId,
      );
      onSuccess();
    } catch (cause) {
      console.error("Failed to confirm payment:", cause);
      onFailure();
    }
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

      {loadingIntent && (
        <p className="text-sm text-gray-400 py-8">Setting up secure payment…</p>
      )}

      {!loadingIntent && intentError && (
        <div className="text-sm text-red-500 py-8">{intentError}</div>
      )}

      {!loadingIntent && !intentError && clientSecret && (
        <StripePaymentForm
          clientSecret={clientSecret}
          amount={amount}
          currency={currency}
          onSuccess={handlePaymentSuccess}
          onError={() => onFailure()}
        />
      )}

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mt-4">
        <ShieldCheck className="w-3.5 h-3.5" /> Powered by Stripe · 256-bit SSL
        · PCI DSS Compliant
      </div>
    </div>
  );
}