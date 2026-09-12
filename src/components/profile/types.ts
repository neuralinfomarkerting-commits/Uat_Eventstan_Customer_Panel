export type Tab = "personal" | "addresses";

export interface Address {
  addressId: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  poBoxNumber: string;
  // Emirate (currently always "Dubai" — the platform only serves Dubai for now).
  state: string;
  // Area/community within the state, chosen from a searchable dropdown.
  city: string;
  isDefault: boolean;
}

export type AddressFormData = Omit<Address, "addressId"> & { addressId?: string };

export const emptyAddressForm: AddressFormData = {
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  poBoxNumber: "",
  state: "Dubai",
  city: "",
  isDefault: false,
};

export interface ApiBooking {
  id: string;
  status: string;
  paymentStatus?: string;
  eventAddress: string;
  totalAmount: number;
  remainingDueAmount: number;
  currency: string;
  createdAt: string;
  items: Array<{ title: string; eventDate: string; quantity: number }>;
  payments: Array<{ amount: number; status: string }>;
}

// Order status — only 4 stages shown to the customer.
export const BOOKING_STATUS_STYLES: Record<string, string> = {
  IN_PROCESS: "bg-orange-100 text-orange-700",
  CONFIRMED: "bg-green-100 text-green-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  IN_PROCESS: "In Process",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// Payment status — tracked separately from order status.
export const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  PARTIALLY_PAID: "bg-amber-100 text-amber-700",
  FULLY_PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-200 text-gray-700",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Payment Pending",
  PARTIALLY_PAID: "Partially Paid",
  FULLY_PAID: "Fully Paid",
  FAILED: "Payment Failed",
  REFUNDED: "Refunded",
};

// Maps a GET /customer/my-bookings/:userId row onto the ApiBooking shape
// this tab renders.
import type { MyBookingResponse } from "@/api/customerApi";

const ORDER_STATUS_MAP: Record<string, string> = {
  PENDING: "IN_PROCESS",
  IN_PROCESS: "IN_PROCESS",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

const PAYMENT_STATUS_MAP: Record<string, string> = {
  PENDING: "PENDING",
  PARTIAL_PAID: "PARTIALLY_PAID",
  FULLY_PAID: "FULLY_PAID",
};

export function mapMyBookingToApiBooking(row: MyBookingResponse): ApiBooking {
  return {
    id: row.checkoutId ?? row.bookingId,
    status: ORDER_STATUS_MAP[row.orderStatus] ?? "IN_PROCESS",
    paymentStatus: row.payment ? PAYMENT_STATUS_MAP[row.payment.paymentStatus] ?? "PENDING" : "PENDING",
    eventAddress: row.address?.addressId ?? "-",
    totalAmount: row.totalAmount,
    remainingDueAmount: row.payment?.remainingAmount ?? row.totalAmount,
    currency: row.payment?.currency ?? "AED",
    createdAt: row.createdAt,
    items: row.checkoutItems.map((item) => ({
      title: item.packageName ?? item.title ?? "Package",
      eventDate: row.eventDate,
      quantity: item.quantity,
    })),
    payments: row.payment
      ? [{ amount: row.payment.amountPaid, status: row.payment.amountPaid > 0 ? "SUCCEEDED" : "PENDING" }]
      : [],
  };
}

// Derive a payment status when the backend hasn't sent one yet.
export function derivePaymentStatus(booking: ApiBooking): string {
  if (booking.paymentStatus) return booking.paymentStatus;
  const paid = booking.payments
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((sum, p) => sum + p.amount, 0);
  if (paid <= 0) return "PENDING";
  if (booking.remainingDueAmount > 0) return "PARTIALLY_PAID";
  return "FULLY_PAID";
}
