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
}

export interface RefundRecord {
  amount: number;
  reason: string;
  date: string;
  referenceId: string;
}

export interface Booking {
  id: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  eventAddress: string;
  bookingDate: string;
  totalAmount: number;
  remainingDueAmount: number;
  currency: string;
  createdAt: string;
  items: BookingItem[];
  payments: PaymentRecord[];
  refund?: RefundRecord;
}

// Statuses where no further payment/cancel/refund action applies.
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

export const STATIC_BOOKINGS: Booking[] = [
  {
    id: "CHECKOUT_ID_001",
    status: "IN_PROCESS",
    paymentStatus: "PARTIALLY_PAID",
    eventAddress: "Al Ain, UAE",
    bookingDate: "28 Aug 2026",
    totalAmount: 4500,
    remainingDueAmount: 2250,
    currency: "AED",
    createdAt: "2026-08-28T10:00:00.000Z",
    items: [
      {
        bookingId: "BOOKING_ID_001A",
        title: "Venue Rental - Garden Hall",
        vendor: "Garden Hall Events",
        image: "",
        eventDate: "20 Sep 2026",
        eventTime: "5:00 PM – 11:00 PM",
        guests: 80,
        amount: 4500,
        quantity: 1,
      },
    ],
    payments: [
      { id: "PAYMENT_ID_001_01", label: "Partial Payment", amount: 2250, status: "SUCCEEDED", date: "28 Aug 2026, 11:40 AM" },
    ],
  },
  {
    id: "CHECKOUT_ID_002",
    status: "COMPLETED",
    paymentStatus: "FULLY_PAID",
    eventAddress: "Downtown Dubai, UAE",
    bookingDate: "15 Aug 2026",
    totalAmount: 15800,
    remainingDueAmount: 0,
    currency: "AED",
    createdAt: "2026-08-15T10:00:00.000Z",
    items: [
      {
        bookingId: "BOOKING_ID_002A",
        title: "Live Band Entertainment",
        vendor: "Rhythm Live",
        image: "",
        eventDate: "20 Aug 2026",
        eventTime: "7:00 PM – 11:00 PM",
        guests: 120,
        amount: 7900,
        quantity: 1,
      },
      {
        bookingId: "BOOKING_ID_002B",
        title: "Premium Catering Package",
        vendor: "XYZ Catering",
        image: "",
        eventDate: "20 Aug 2026",
        eventTime: "7:00 PM – 11:00 PM",
        guests: 120,
        amount: 7900,
        quantity: 1,
      },
    ],
    payments: [
      { id: "PAYMENT_ID_002_01", label: "Full Payment", amount: 15800, status: "SUCCEEDED", date: "15 Aug 2026, 09:20 AM" },
    ],
  },
  {
    id: "CHECKOUT_ID_003",
    status: "CONFIRMED",
    paymentStatus: "PARTIALLY_PAID",
    eventAddress: "Palm Jumeirah, Dubai, UAE",
    bookingDate: "01 Sep 2026",
    totalAmount: 24200,
    remainingDueAmount: 12100,
    currency: "AED",
    createdAt: "2026-09-01T10:00:00.000Z",
    items: [
      {
        bookingId: "BOOKING_ID_003A",
        title: "Premium Decoration Package",
        vendor: "ABC Events",
        image: "",
        eventDate: "04 Sep 2026",
        eventTime: "11:00 AM – 11:00 PM",
        guests: 5,
        amount: 8100,
        quantity: 1,
      },
      {
        bookingId: "BOOKING_ID_003B",
        title: "Premium Catering Package",
        vendor: "XYZ Catering",
        image: "",
        eventDate: "04 Sep 2026",
        eventTime: "11:00 AM – 11:00 PM",
        guests: 5,
        amount: 8100,
        quantity: 1,
      },
      {
        bookingId: "BOOKING_ID_003C",
        title: "Professional Photography",
        vendor: "Frame Studio",
        image: "",
        eventDate: "04 Sep 2026",
        eventTime: "11:00 AM – 11:00 PM",
        guests: 5,
        amount: 8000,
        quantity: 1,
      },
    ],
    payments: [
      { id: "PAYMENT_ID_003_01", label: "Partial Payment", amount: 12100, status: "SUCCEEDED", date: "01 Sep 2026, 10:30 AM" },
    ],
  },
  {
    id: "CHECKOUT_ID_004",
    status: "IN_PROCESS",
    paymentStatus: "PARTIALLY_PAID",
    eventAddress: "Jumeirah Beach Residence, Dubai, UAE",
    bookingDate: "02 Sep 2026",
    totalAmount: 38500,
    remainingDueAmount: 19250,
    currency: "AED",
    createdAt: "2026-09-02T10:00:00.000Z",
    items: [
      {
        bookingId: "BOOKING_ID_004A",
        title: "Standard Decoration Package",
        vendor: "Bloom Decor",
        image: "",
        eventDate: "10 Oct 2026",
        eventTime: "6:00 PM – Midnight",
        guests: 150,
        amount: 8500,
        quantity: 1,
      },
      {
        bookingId: "BOOKING_ID_004B",
        title: "Buffet Catering Package",
        vendor: "XYZ Catering",
        image: "",
        eventDate: "10 Oct 2026",
        eventTime: "6:00 PM – Midnight",
        guests: 150,
        amount: 12000,
        quantity: 1,
      },
      {
        bookingId: "BOOKING_ID_004C",
        title: "DJ & Sound System",
        vendor: "Beat Box Audio",
        image: "",
        eventDate: "10 Oct 2026",
        eventTime: "6:00 PM – Midnight",
        guests: 150,
        amount: 6000,
        quantity: 1,
      },
      {
        bookingId: "BOOKING_ID_004D",
        title: "Professional Photography",
        vendor: "Frame Studio",
        image: "",
        eventDate: "10 Oct 2026",
        eventTime: "6:00 PM – Midnight",
        guests: 150,
        amount: 7000,
        quantity: 1,
      },
      {
        bookingId: "BOOKING_ID_004E",
        title: "Event Lighting Setup",
        vendor: "Glow Productions",
        image: "",
        eventDate: "10 Oct 2026",
        eventTime: "6:00 PM – Midnight",
        guests: 150,
        amount: 5000,
        quantity: 1,
      },
    ],
    payments: [
      { id: "PAYMENT_ID_004_01", label: "Partial Payment", amount: 19250, status: "SUCCEEDED", date: "02 Sep 2026, 09:05 AM" },
    ],
  },
  {
    id: "CHECKOUT_ID_005",
    status: "CONFIRMED",
    paymentStatus: "PARTIALLY_PAID",
    eventAddress: "Sharjah, UAE",
    bookingDate: "25 Aug 2026",
    totalAmount: 62400,
    remainingDueAmount: 31200,
    currency: "AED",
    createdAt: "2026-08-25T10:00:00.000Z",
    items: [
      {
        bookingId: "BOOKING_ID_005A",
        title: "Grand Venue Rental",
        vendor: "Sharjah Grand Hall",
        image: "",
        eventDate: "15 Nov 2026",
        eventTime: "5:00 PM – Midnight",
        guests: 300,
        amount: 62400,
        quantity: 1,
      },
    ],
    payments: [
      { id: "PAYMENT_ID_005_01", label: "Partial Payment", amount: 31200, status: "SUCCEEDED", date: "25 Aug 2026, 02:15 PM" },
    ],
  },
];

export function getBookingById(id: string): Booking | undefined {
  const normalized = id.toUpperCase();
  return STATIC_BOOKINGS.find((b) => b.id === normalized);
}

// Maps GET /customer/my-bookings/:userId rows (MyBookingResponse) onto the
// Booking shape this UI already renders.
import type { MyBookingResponse } from "@/api/customerApi";

const ORDER_STATUS_MAP: Record<string, BookingStatus> = {
  PENDING: "IN_PROCESS",
  IN_PROCESS: "IN_PROCESS",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

const PAYMENT_STATUS_MAP: Record<string, PaymentStatus> = {
  PENDING: "PENDING",
  PARTIAL_PAID: "PARTIALLY_PAID",
  FULLY_PAID: "FULLY_PAID",
};

export function mapMyBookingToBooking(row: MyBookingResponse): Booking {
  const status = ORDER_STATUS_MAP[row.orderStatus] ?? "IN_PROCESS";
  const paymentStatus = row.payment ? PAYMENT_STATUS_MAP[row.payment.paymentStatus] ?? "PENDING" : "PENDING";
  const currency = row.payment?.currency ?? "AED";
  const eventTime = row.startTime && row.endTime ? `${row.startTime} – ${row.endTime}` : "";

  return {
    id: row.checkoutId ?? row.bookingId,
    status,
    paymentStatus,
    eventAddress: row.address?.addressId ?? "-",
    bookingDate: row.eventDate,
    totalAmount: row.totalAmount,
    remainingDueAmount: row.payment?.remainingAmount ?? row.totalAmount,
    currency,
    createdAt: row.createdAt,
    items: row.checkoutItems.map((item) => ({
      bookingId: item.checkoutItemId ?? row.bookingId,
      title: item.packageName ?? item.title ?? "Package",
      vendor: item.vendorName ?? "",
      image: "",
      eventDate: row.eventDate,
      eventTime,
      guests: row.guestCount ?? 0,
      amount: item.totalAmount,
      quantity: item.quantity,
    })),
    payments: row.payment
      ? [
          {
            id: row.payment.paymentId ?? row.bookingId,
            label: row.payment.paymentType === "FULL" ? "Full Payment" : "Partial Payment",
            amount: row.payment.amountPaid,
            status: "SUCCEEDED",
            date: row.createdAt,
          },
        ]
      : [],
  };
}