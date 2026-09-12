export type Tab = "personal" | "addresses" | "bookings";

export interface Address {
  addressId: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  poBoxNumber: string;
  isDefault: boolean;
}

export type AddressFormData = Omit<Address, "addressId"> & { addressId?: string };

export const emptyAddressForm: AddressFormData = {
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  poBoxNumber: "",
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
