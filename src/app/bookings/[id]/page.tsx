"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { customerApi } from "@/api/customerApi";
import Confetti from "@/components/ui/Confetti";
import {
  getBookingById,
  mapMyBookingToBooking,
  STATIC_BOOKINGS,
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

type PaymentMethod = "card" | "apple" | "google" | "other";

export default function BookingDetailsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const checkoutId =
    typeof params?.id === "string"
      ? params.id
      : "CHECKOUT_ID_001";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookingLoading, setBookingLoading] = useState(true);
  const currency = booking?.currency ?? "AED";

  const [step, setStep] = useState<Step>("details");
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [status, setStatus] = useState<BookingStatus>("IN_PROCESS");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("PENDING");
  const [refund, setRefund] = useState<RefundRecord | undefined>(undefined);
  const [refundReason, setRefundReason] = useState("Change of plans");
  const [cancelling, setCancelling] = useState(false);
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/auth/login?redirect=/bookings/${params?.id ?? ""}`);
      return;
    }

    customerApi.bookings
      .list(user.id)
      .then((result) => {
        const list = Array.isArray(result) ? result.map(mapMyBookingToBooking) : [];
        const found = list.find(
          (b) => b.id === checkoutId || b.id.toUpperCase() === checkoutId.toUpperCase()
        );
        const resolved = found ?? getBookingById(checkoutId.toUpperCase()) ?? STATIC_BOOKINGS[0];
        setBooking(resolved);
        setPayments(resolved.payments);
        setStatus(resolved.status);
        setPaymentStatus(resolved.paymentStatus);
        setRefund(resolved.refund);
      })
      .catch(() => {
        const fallback = getBookingById(checkoutId.toUpperCase()) ?? STATIC_BOOKINGS[0];
        setBooking(fallback);
        setPayments(fallback.payments);
        setStatus(fallback.status);
        setPaymentStatus(fallback.paymentStatus);
        setRefund(fallback.refund);
      })
      .finally(() => setBookingLoading(false));
  }, [authLoading, user, checkoutId]);

  if (authLoading || !user || bookingLoading || !booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
        Loading your booking...
      </div>
    );
  }

  const totalAmount = booking.totalAmount;
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(totalAmount - paid, 0);
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
        date: "04 Sep 2026, 11:15 AM",
      },
    ]);
    setStatus("CONFIRMED");
    setPaymentStatus("FULLY_PAID");
    setStep("success");
    setConfettiTrigger((n) => n + 1);
  };

  const handleGatewayFailure = () => {
    setPaymentStatus("FAILED");
    setStep("failed");
  };

  const handleConfirmCancel = () => {
    setCancelling(true);
    setTimeout(() => {
      setCancelling(false);
      setStatus("CANCELLED");
      setStep("cancelled");
    }, 900);
  };

  const handleConfirmRefund = () => {
    setRefunding(true);
    setTimeout(() => {
      setRefunding(false);
      setRefund({
        amount: paid,
        reason: refundReason,
        date: "04 Sep 2026, 12:05 PM",
        referenceId: `REFUND_${booking.id.replace("CHECKOUT_ID_", "")}`,
      });
      setPaymentStatus("REFUNDED");
      setStep("refunded");
    }, 1100);
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
          method={method}
          setMethod={setMethod}
          onBack={() => setStep("details")}
          onPay={handlePayNow}
        />
      )}

      {step === "gateway" && (
        <GatewayScreen
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
            checkoutId={booking.id}
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
          checkoutId={booking.id}
          currency={currency}
          totalAmount={totalAmount}
          paid={paid}
          remaining={remaining}
          isFullyPaid={isFullyPaid}
          payments={payments}
          refund={refund}
          items={booking.items}
          eventAddress={booking.eventAddress}
          bookingDate={booking.bookingDate}
          onBack={() => setStep("details")}
        />
      )}

      {step === "cancel" && (
        <CancelScreen
          checkoutId={booking.id}
          currency={currency}
          paid={paid}
          cancelling={cancelling}
          onConfirm={handleConfirmCancel}
          onBack={() => setStep("details")}
        />
      )}

      {step === "cancelled" && (
        <CancelledScreen
          checkoutId={booking.id}
          currency={currency}
          paid={paid}
          onBack={() => setStep("details")}
        />
      )}

      {step === "refund" && (
        <RefundScreen
          checkoutId={booking.id}
          currency={currency}
          paid={paid}
          reason={refundReason}
          setReason={setRefundReason}
          refunding={refunding}
          onConfirm={handleConfirmRefund}
          onBack={() => setStep("details")}
        />
      )}

      {step === "refunded" && refund && (
        <RefundedScreen
          checkoutId={booking.id}
          currency={currency}
          refund={refund}
          onBack={() => setStep("details")}
        />
      )}
    </div>
  );
}