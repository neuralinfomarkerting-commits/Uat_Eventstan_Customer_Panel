"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useUaeLocations } from "@/lib/useUaeLocations";
import { formatAddressById } from "@/lib/formatAddress";
import { customerApi, getPackages, getServices } from "@/api/customerApi";
import Confetti from "@/components/ui/Confetti";
import {
  mapMyBookingToBooking,
  syncBookingsWithCore,
  TERMINAL_STATUSES,
  type Booking,
  type BookingStatus,
  type PaymentStatus,
  type PaymentRecord,
  type RefundRecord,
} from "@/lib/mockBookings";
import DetailsScreen from "@/components/bookings/DetailsScreen";
import PayScreen from "@/components/bookings/PayScreen";
import GatewayScreen from "@/components/bookings/GatewayScreen";
import FailedScreen from "@/components/bookings/FailedScreen";
import SuccessScreen from "@/components/bookings/SuccessScreen";
import HistoryScreen from "@/components/bookings/HistoryScreen";
import CancelScreen from "@/components/bookings/CancelScreen";
import CancelledScreen from "@/components/bookings/CancelledScreen";
import RefundScreen from "@/components/bookings/RefundScreen";
import RefundedScreen from "@/components/bookings/RefundedScreen";

function resolveImage(...candidates: Array<string | undefined | null>): string {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  return "";
}

type Step =
  | "details"
  | "pay"
  | "gateway"
  | "success"
  | "failed"
  | "history"
  | "cancel"
  | "cancelled"
  | "refund"
  | "refunded";

export default function BookingDetailsPage() {
  const { user, loading: authLoading } = useAuth();
  const { cities: uaeCities } = useUaeLocations();
  const router = useRouter();
  const params = useParams();
  const checkoutId =
    typeof params?.id === "string"
      ? params.id
      : "";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  // Real load failure (API/network/auth) - kept separate from "booking not found".
  const [loadError, setLoadError] = useState<string | null>(null);
  const currency = booking?.currency ?? "AED";

  const [step, setStep] = useState<Step>("details");
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [status, setStatus] = useState<BookingStatus>("IN_PROCESS");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("PENDING");
  const [refund, setRefund] = useState<RefundRecord | undefined>(undefined);
  const [refundReason, setRefundReason] = useState("Change of plans");
  const [cancelling, setCancelling] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/auth/login?redirect=/bookings/${params?.id ?? ""}`);
      return;
    }

    customerApi.bookings
      .list(user.id)
      .then(async (result) => {
        const rows = Array.isArray(result) ? result : [];
        let imageByPackageId = new Map<string, string>();
        try {
          const [packages, services] = await Promise.all([getPackages(), getServices()]);
          const serviceById = new Map(services.map((s) => [s.id, s]));
          imageByPackageId = new Map(
            packages.map((p) => {
              const pAny = p as any;
              const service = serviceById.get(p.service_id);
              return [
                p.id,
                resolveImage(pAny.image_url, pAny.imageUrl, pAny.image, service?.image_url, (service as any)?.imageUrl, service?.gallery?.[0], pAny.gallery?.[0], pAny.items?.[0]?.service?.imageUrl, pAny.items?.[0]?.service?.image_url),
              ];
            })
          );
        } catch (error) {
          console.error("Failed to load images for booking:", error);
        }

        const list = rows.flatMap((row) => {
          try {
            return [mapMyBookingToBooking(row, imageByPackageId)];
          } catch (err) {
            console.warn("[booking] skipped a booking that couldn't be read", row, err);
            return [];
          }
        });
        let wanted = checkoutId;
        try {
          wanted = decodeURIComponent(checkoutId);
        } catch {
        }
        wanted = wanted.trim().toUpperCase();
        const found = list.find(
          (b) => b.id.toUpperCase() === wanted || b.bookingId?.toUpperCase() === wanted
        );
        if (!found) {
          console.warn(
            "[booking] no match for",
            wanted,
            "available:",
            list.map((b) => ({ id: b.id, bookingId: b.bookingId })),
          );
        }
        if (!found) {
          setNotFound(true);
          return;
        }
        const current = (await syncBookingsWithCore([found]))[0] ?? found;
        setBooking(current);
        setPayments(current.payments);
        setStatus(current.status);
        setPaymentStatus(current.paymentStatus);
        setRefund(current.refund);
      })
      .catch((err) => {
        console.error("[booking] failed to load bookings", err);
        setLoadError(err instanceof Error ? err.message : "Something went wrong while loading your booking.");
      })
      .finally(() => setBookingLoading(false));
  }, [authLoading, user, checkoutId]);

  if (authLoading || !user || bookingLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
        Loading your booking...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Couldn&apos;t load your booking</h2>
        <p className="text-gray-500 mb-1">{loadError}</p>
        <p className="text-gray-400 text-sm mb-6">Please check your connection and try again.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600"
          >
            Try again
          </button>
          <button
            onClick={() => router.push("/bookings")}
            className="border border-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold hover:border-orange-300"
          >
            My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (notFound || !booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking not found</h2>
        <p className="text-gray-500 mb-6">We couldn&apos;t find a booking with this ID on your account.</p>
        <button
          onClick={() => router.push("/bookings")}
          className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600"
        >
          Back to My Bookings
        </button>
      </div>
    );
  }

  const totalAmount = booking.totalAmount;
  const paidFromTransactions = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining =
    typeof booking.remainingDueAmount === "number"
      ? Math.max(booking.remainingDueAmount, 0)
      : Math.max(totalAmount - paidFromTransactions, 0);
  const paid = Math.max(totalAmount - remaining, 0);
  const percentPaid =
    totalAmount > 0 ? Math.round((paid / totalAmount) * 100) : 0;
  const isFullyPaid = remaining === 0;
  const isTerminal = TERMINAL_STATUSES.includes(status);
  const paidNow = payments[payments.length - 1]?.amount ?? 0;
  const previousPaid = paid - paidNow;

  const handlePayNow = () => {
    setStep("gateway");
  };

  const handleGatewaySuccess = () => {
    setPayments((prev) => [
      ...prev,
      {
        id: `PAYMENT_ID_${booking.id.replace("CHECKOUT_ID_", "")}_${String(prev.length + 1).padStart(2, "0")}`,
        label: prev.length === 0 ? "Full Payment" : "Final Payment",
        amount: remaining,
        status: "SUCCEEDED",
        date: new Date().toLocaleString(),
      },
    ]);
    setBooking((prev) =>
      prev ? { ...prev, remainingDueAmount: 0, paymentStatus: "FULLY_PAID" } : prev,
    );
    setStatus("CONFIRMED");
    setPaymentStatus("FULLY_PAID");
    setStep("success");
    setConfettiTrigger((n) => n + 1);
  };

  const handleGatewayFailure = () => {
    setPaymentStatus("FAILED");
    setStep("failed");
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      const result = await customerApi.bookings.cancel(booking.bookingId, refundReason);
      setStatus("CANCELLED");
      if (result?.refund) {
        setRefund({
          amount: result.refund.amount,
          reason: refundReason,
          date: new Date().toLocaleString(),
          referenceId: result.refund.referenceId ?? `REFUND_${booking.bookingId}`,
        });
        setPaymentStatus("REFUNDED");
      }
      setStep("cancelled");
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : "Failed to cancel booking.");
    } finally {
      setCancelling(false);
    }
  };
  const handleConfirmRefund = async () => {
    setRefunding(true);
    setCancelError(null);
    try {
      const estimate = await customerApi.bookings.refundEstimate(booking.bookingId);
      const result = await customerApi.bookings.cancel(booking.bookingId, refundReason);
      const refundAmount = result?.refund?.amount ?? estimate?.refundAmount ?? paid;
      setRefund({
        amount: refundAmount,
        reason: refundReason,
        date: new Date().toLocaleString(),
        referenceId: result?.refund?.referenceId ?? `REFUND_${booking.bookingId}`,
      });
      setStatus("CANCELLED");
      setPaymentStatus("REFUNDED");
      setStep("refunded");
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : "Failed to process refund.");
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {step === "details" && (
        <DetailsScreen
          booking={booking}
          currency={currency}
          totalAmount={totalAmount}
          paid={paid}
          remaining={remaining}
          percentPaid={percentPaid}
          isFullyPaid={isFullyPaid}
          status={status}
          paymentStatus={paymentStatus}
          isTerminal={isTerminal}
          refund={refund}
          onPayRemaining={() => setStep("pay")}
          onViewHistory={() => setStep("history")}
          onCancelBooking={() => setStep("cancel")}
        />
      )}

      {step === "pay" && (
        <PayScreen
          booking={booking}
          currency={currency}
          totalAmount={totalAmount}
          paid={paid}
          remaining={remaining}
          onBack={() => setStep("details")}
          onPay={handlePayNow}
        />
      )}

      {step === "gateway" && (
        <GatewayScreen
          bookingId={booking.bookingId}
          bookingIds={booking.bookingIdCandidates}
          amount={remaining}
          currency={currency}
          onSuccess={handleGatewaySuccess}
          onFailure={handleGatewayFailure}
        />
      )}

      {step === "failed" && (
        <FailedScreen
          amount={remaining}
          currency={currency}
          onRetry={() => setStep("gateway")}
          onBack={() => setStep("details")}
          onCancel={() => setStep("cancel")}
        />
      )}

      {step === "success" && (
        <>
          <Confetti trigger={confettiTrigger} />
          <SuccessScreen
            checkoutId={booking.bookingId}
            currency={currency}
            totalAmount={totalAmount}
            previousPaid={previousPaid}
            paidNow={paidNow}
            onViewBooking={() => setStep("details")}
            onViewHistory={() => setStep("history")}
          />
        </>
      )}

      {step === "history" && (
        <HistoryScreen
          checkoutId={booking.bookingId}
          currency={currency}
          totalAmount={totalAmount}
          paid={paid}
          remaining={remaining}
          isFullyPaid={isFullyPaid}
          payments={payments}
          refund={refund}
          items={booking.items}
          eventAddress={formatAddressById(booking.eventAddress, user?.addresses, new Map(uaeCities.map((c) => [c.id, c.name])))}
          bookingDate={booking.bookingDate}
          onBack={() => setStep("details")}
        />
      )}

      {step === "cancel" && (
        <CancelScreen
          checkoutId={booking.bookingId}
          currency={currency}
          paid={paid}
          cancelling={cancelling}
          onConfirm={handleConfirmCancel}
          onBack={() => setStep("details")}
          errorMessage={cancelError}
        />
      )}

      {step === "cancelled" && (
        <CancelledScreen
          checkoutId={booking.bookingId}
          currency={currency}
          paid={paid}
          onBack={() => setStep("details")}
        />
      )}

      {step === "refund" && (
        <RefundScreen
          checkoutId={booking.bookingId}
          currency={currency}
          paid={paid}
          reason={refundReason}
          setReason={setRefundReason}
          refunding={refunding}
          onConfirm={handleConfirmRefund}
          onBack={() => setStep("details")}
          errorMessage={cancelError}
        />
      )}

      {step === "refunded" && refund && (
        <RefundedScreen
          checkoutId={booking.bookingId}
          currency={currency}
          refund={refund}
          onBack={() => setStep("details")}
        />
      )}
    </div>
  );
}