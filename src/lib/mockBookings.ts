export type BookingStatus = "IN_PROCESS" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export type PaymentStatus = "PENDING" | "PARTIALLY_PAID" | "FULLY_PAID" | "FAILED" | "REFUNDED";

export interface BookingItem {
  bookingId: string;
  title: string;
  vendor: string;
  image: string;
  eventDate: string;
  eventTime: string;
  guests: number;
  amount: number;
  quantity: number;
}

export interface PaymentRecord {
  id: string;
  label: string;
  amount: number;
  status: "SUCCEEDED";
  date: string;
  transactionId?: string;
  paymentId?: string;
}

export interface RefundRecord {
  amount: number;
  reason: string;
  date: string;
  referenceId: string;
}

export interface Booking {
  id: string;
  bookingId: string;
  bookingIdCandidates?: string[];
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  eventAddress: string;
  bookingDate: string;
  eventDate: string;
  createdAt: string;
  totalAmount: number;
  remainingDueAmount: number;
  currency: string;
  items: BookingItem[];
  payments: PaymentRecord[];
  refund?: RefundRecord;
}

export const TERMINAL_STATUSES: BookingStatus[] = ["COMPLETED", "CANCELLED"];

export const STATUS_STYLES: Record<BookingStatus, string> = {
  IN_PROCESS: "bg-orange-100 text-orange-700",
  CONFIRMED: "bg-green-100 text-green-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  IN_PROCESS: "In Process",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  PARTIALLY_PAID: "bg-amber-100 text-amber-700",
  FULLY_PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-200 text-gray-700",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Payment Pending",
  PARTIALLY_PAID: "Partially Paid",
  FULLY_PAID: "Fully Paid",
  FAILED: "Payment Failed",
  REFUNDED: "Refunded",
};

import { customerApi } from "@/api/customerApi";
import type { MyBookingResponse } from "@/api/customerApi";

const ORDER_STATUS_MAP: Record<string, BookingStatus> = {
  "In Process": "IN_PROCESS",
  "Accepted": "CONFIRMED",
  "Confirmed": "CONFIRMED",
  "Completed": "COMPLETED",
  "Rejected": "CANCELLED",
  "Cancelled": "CANCELLED",
  "Refunded": "CANCELLED",
};

const PAYMENT_STATUS_MAP: Record<string, PaymentStatus> = {
  PENDING: "PENDING",
  PARTIAL_PAID: "PARTIALLY_PAID",
  FULLY_PAID: "FULLY_PAID",
};

export function mapMyBookingToBooking(
  row: MyBookingResponse,
  
  
  
  imageByPackageId?: Map<string, string>
): Booking {
  const status = ORDER_STATUS_MAP[row.orderStatus] ?? "IN_PROCESS";
  const paymentStatus = row.payment ? PAYMENT_STATUS_MAP[row.payment.paymentStatus] ?? "PENDING" : "PENDING";
  const currency = row.payment?.currency ?? "AED";
  const eventTime = row.startTime && row.endTime ? `${row.startTime} – ${row.endTime}` : "";

  const bookingIdCandidates = Array.from(
    new Set(
      [
        row.bookingId,
        row.payment?.bookingId,
        ...(row.checkoutItems ?? []).map((i) => i.bookingId),
        ...(row.checkoutItems ?? []).map((i) => i.checkoutItemId),
        row.checkoutId,
      ].filter((v): v is string => typeof v === "string" && v.length > 0),
    ),
  );

  return {
    id: row.checkoutId ?? row.bookingId,
    bookingIdCandidates,
    bookingId: bookingIdCandidates[0] ?? row.checkoutId,
    status,
    paymentStatus,
    eventAddress: row.address?.addressId ?? "-",
    bookingDate: row.eventDate,
    eventDate: row.eventDate,
    totalAmount: row.totalAmount,
    remainingDueAmount: row.payment?.remainingAmount ?? row.totalAmount,
    currency,
    createdAt: row.createdAt,
    items: (row.checkoutItems ?? []).map((item) => ({
      bookingId: item.checkoutItemId ?? row.bookingId,
      title: item.packageName ?? item.title ?? "Package",
      vendor: item.vendorName ?? "",
      image: item.imageUrl || (item.packageId && imageByPackageId?.get(item.packageId)) || "",
      eventDate: row.eventDate,
      eventTime,
      guests: row.guestCount ?? 0,
      amount: item.totalAmount,
      quantity: item.quantity,
    })),
    payments: buildPaymentRecords(row),
  };
}

function toStripeId(value?: string | null): string | undefined {
  return value && /^(pi|py|ch)_[A-Za-z0-9]+$/.test(value) ? value : undefined;
}

function buildPaymentRecords(row: MyBookingResponse): PaymentRecord[] {
  const transactions = row.transactions ?? [];

  if (transactions.length > 0) {
    const isFullUpfront = row.payment?.paymentType === "FULL";
    return transactions.map((txn, index) => {
      const label =
        index === 0
          ? isFullUpfront
            ? "Full Payment"
            : "Advance Payment"
          : "Remaining Payment";
      return {
        id: txn.stripePaymentIntentId ?? `${row.bookingId}_${index + 1}`,
        label,
        amount: txn.amount,
        status: "SUCCEEDED" as const,
        date: txn.paidAt ?? txn.createdAt ?? row.createdAt,
        transactionId: toStripeId(txn.stripePaymentIntentId),
        paymentId: row.payment?.paymentId ?? undefined,
      };
    });
  }

  if (row.payment && row.payment.amountPaid > 0) {
    return [
      {
        id: row.payment.paymentId ?? row.bookingId,
        label: row.payment.paymentType === "FULL" ? "Full Payment" : "Partial Payment",
        amount: row.payment.amountPaid,
        status: "SUCCEEDED",
        date: row.createdAt,
        paymentId: row.payment.paymentId ?? undefined,
      },
    ];
  }

  return [];
}

export async function syncBookingsWithCore(list: Booking[]): Promise<Booking[]> {
  if (list.length === 0) return list;
  let core: Awaited<ReturnType<typeof customerApi.bookings.listMine>> = [];
  try {
    core = await customerApi.bookings.listMine();
  } catch (err) {
    console.warn("[bookings] could not refresh payment totals", err);
    return list;
  }
  const byRef = new Map<string, (typeof core)[number]>();
  for (const c of core) {
    for (const ref of [c.id, c.orderId, c.customerBookingId, c.customerCheckoutId]) {
      if (ref) byRef.set(ref.toUpperCase(), c);
    }
  }
  return list.map((b) => {
    const c = [b.bookingId, b.id, ...(b.bookingIdCandidates ?? [])]
      .filter(Boolean)
      .map((r) => byRef.get(r.toUpperCase()))
      .find(Boolean);
    if (!c?.payments) return b;
    const succeeded = c.payments
      .filter((p) => p.status === "SUCCEEDED")
      .sort((x, y) =>
        (x.succeededAt ?? x.createdAt ?? "").localeCompare(y.succeededAt ?? y.createdAt ?? ""),
      );
    const paid = succeeded.reduce((sum, p) => sum + p.amount, 0);
    if (paid <= 0) return b;
    const remaining = Math.max(b.totalAmount - paid, 0);
    const knownPaid = b.payments.reduce((sum, p) => sum + p.amount, 0);
    const label = (t?: string) =>
      t === "REMAINING" ? "Remaining Payment" : t === "FULL" ? "Full Payment" : "Advance Payment";
    const payments =
      paid > knownPaid
        ? succeeded.map((p) => ({
            id: p.providerRef ?? p.id,
            label: label(p.paymentType),
            amount: p.amount,
            status: "SUCCEEDED" as const,
            date: p.succeededAt ?? p.createdAt ?? b.createdAt,
            transactionId: toStripeId(p.providerRef),
            paymentId: p.id,
          }))
        : b.payments;
    return {
      ...b,
      remainingDueAmount: remaining,
      paymentStatus: remaining === 0 ? "FULLY_PAID" : "PARTIALLY_PAID",
      payments,
    };
  });
}
