"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { type PaymentRecord, type RefundRecord, type BookingItem } from "@/lib/mockBookings";

interface DownloadReceiptButtonProps {
  checkoutId: string;
  currency: string;
  totalAmount: number;
  paid: number;
  remaining: number;
  isFullyPaid: boolean;
  payments: PaymentRecord[];
  refund: RefundRecord | undefined;
  items: BookingItem[];
  eventAddress: string;
  bookingDate: string;
  className?: string;
}

const ORANGE: [number, number, number] = [234, 88, 12];
const ORANGE_LIGHT: [number, number, number] = [255, 247, 237];
const GREEN: [number, number, number] = [22, 163, 74];
const GREEN_LIGHT: [number, number, number] = [240, 253, 244];
const GRAY_900: [number, number, number] = [23, 23, 23];
const GRAY_700: [number, number, number] = [55, 65, 81];
const GRAY_500: [number, number, number] = [107, 114, 128];
const GRAY_400: [number, number, number] = [156, 163, 175];
const GRAY_100: [number, number, number] = [243, 244, 246];
const GRAY_50: [number, number, number] = [250, 250, 250];
const BORDER: [number, number, number] = [229, 231, 235];
const WHITE: [number, number, number] = [255, 255, 255];

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Renders the "Download Receipt" button and generates a nicely styled PDF
 * receipt (via jsPDF, loaded on demand) for a booking when clicked.
 * Extracted from bookings/[id]/page.tsx's HistoryScreen so it can be
 * reused/tested on its own.
 */
export default function DownloadReceiptButton({
  checkoutId,
  currency,
  totalAmount,
  paid,
  remaining,
  isFullyPaid,
  payments,
  refund,
  items,
  eventAddress,
  bookingDate,
  className,
}: DownloadReceiptButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReceipt = async () => {
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 15;
      const contentWidth = pageWidth - marginX * 2;
      let y = 0;

      const ensureSpace = (needed: number) => {
        if (y + needed > pageHeight - 24) {
          doc.addPage();
          y = 18;
        }
      };

      const sectionHeading = (label: string) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11.5);
        doc.setTextColor(...GRAY_900);
        doc.text(label, marginX, y);
        y += 8;
      };

      // ---------- Header banner ----------
      const headerHeight = 32;
      doc.setFillColor(...ORANGE_LIGHT);
      doc.rect(0, 0, pageWidth, headerHeight, "F");
      doc.setDrawColor(...ORANGE);
      doc.setLineWidth(0.6);
      doc.line(0, headerHeight, pageWidth, headerHeight);
      doc.setLineWidth(0.2);

      const logoData = await loadImageAsDataUrl("/eventstan-logo.png");
      if (logoData) {
        const logoWidth = 34;
        const logoHeight = logoWidth / 4.5;
        try {
          doc.addImage(logoData, "PNG", marginX, 9, logoWidth, logoHeight);
        } catch {
        }
      } else {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(...GRAY_900);
        doc.text("Event", marginX, 20);
        doc.setTextColor(...ORANGE);
        doc.text("Stan", marginX + doc.getTextWidth("Event"), 20);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(...ORANGE);
      doc.text("Booking Receipt", pageWidth - marginX, 15, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...GRAY_500);
      doc.text(
        `Generated: ${new Date().toLocaleString("en-GB")}`,
        pageWidth - marginX,
        21,
        { align: "right" },
      );
      const statusText = refund ? "Refunded" : isFullyPaid ? "Fully Paid" : "Partially Paid";
      const statusColor: [number, number, number] = refund ? GRAY_500 : isFullyPaid ? GREEN : ORANGE;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...statusColor);
      doc.text(statusText.toUpperCase(), pageWidth - marginX, 27, { align: "right" });

      y = headerHeight + 12;

      // ---------- Info card: Checkout ID / Booking Date / Event Address ----------
      const infoCardHeight = 24;
      doc.setFillColor(...GRAY_50);
      doc.setDrawColor(...BORDER);
      doc.roundedRect(marginX, y, contentWidth, infoCardHeight, 2, 2, "FD");

      const colGap = 6;
      const col1X = marginX + 6;
      const col2X = marginX + contentWidth * 0.38;
      const col3X = marginX + contentWidth * 0.68;

      const infoField = (x: number, label: string, value: string, maxWidth: number) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...GRAY_400);
        doc.text(label.toUpperCase(), x, y + 8);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...GRAY_900);
        doc.text(value || "-", x, y + 14, { maxWidth });
      };

      infoField(col1X, "Checkout ID", checkoutId, col2X - col1X - colGap);
      infoField(col2X, "Booking Date", bookingDate, col3X - col2X - colGap);
      infoField(
        col3X,
        "Event Address",
        eventAddress || "-",
        marginX + contentWidth - col3X - 6,
      );

      y += infoCardHeight + 12;

      // ---------- Packages ----------
      sectionHeading(`Packages (${items.length})`);

      for (const item of items) {
        ensureSpace(28);
        const rowHeight = 24;
        doc.setDrawColor(...BORDER);
        doc.roundedRect(marginX, y, contentWidth, rowHeight, 2, 2, "S");

        const imgSize = 18;
        const imgPad = 3;
        const imgData = await loadImageAsDataUrl(item.image);
        if (imgData) {
          try {
            doc.addImage(imgData, "JPEG", marginX + imgPad, y + imgPad, imgSize, imgSize);
          } catch {
          }
        } else {
          doc.setFillColor(...GRAY_100);
          doc.rect(marginX + imgPad, y + imgPad, imgSize, imgSize, "F");
        }

        const textX = marginX + imgPad + imgSize + 5;
        const textWidth = pageWidth - marginX - textX - 32;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...GRAY_900);
        doc.text(item.title, textX, y + 8, { maxWidth: textWidth });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...GRAY_500);
        doc.text(item.vendor, textX, y + 13.5, { maxWidth: textWidth });
        doc.setTextColor(...GRAY_400);
        doc.text(
          `${item.eventDate}  ·  ${item.eventTime}  ·  ${item.guests} Guests${item.quantity > 1 ? `  ·  x${item.quantity}` : ""}`,
          textX,
          y + 19,
          { maxWidth: textWidth },
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(...ORANGE);
        doc.text(
          `${currency} ${item.amount.toLocaleString()}`,
          pageWidth - marginX - 4,
          y + rowHeight / 2 + 1.5,
          { align: "right" },
        );

        y += rowHeight + 5;
      }

      y += 3;
      ensureSpace(50);

      // ---------- Payment Summary (boxed) ----------
      sectionHeading("Payment Summary");

      const summaryBoxHeight = 38;
      doc.setFillColor(...WHITE);
      doc.setDrawColor(...BORDER);
      doc.roundedRect(marginX, y, contentWidth, summaryBoxHeight, 2, 2, "FD");

      let sy = y + 8;
      const summaryRow = (
        label: string,
        value: string,
        color: [number, number, number] = GRAY_700,
        bold = false,
      ) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...GRAY_500);
        doc.text(label, marginX + 6, sy);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setTextColor(...color);
        doc.text(value, pageWidth - marginX - 6, sy, { align: "right" });
        sy += 7;
      };

      summaryRow("Total Amount", `${currency} ${totalAmount.toLocaleString()}`, GRAY_900, true);
      summaryRow("Total Paid", `${currency} ${paid.toLocaleString()}`, GREEN, true);
      summaryRow("Remaining Amount", `${currency} ${remaining.toLocaleString()}`, ORANGE, true);
      doc.setDrawColor(...BORDER);
      doc.line(marginX + 6, sy - 3, pageWidth - marginX - 6, sy - 3);
      sy += 2;
      summaryRow(
        "Payment Status",
        refund ? "Refunded" : isFullyPaid ? "Fully Paid" : "Partially Paid",
        statusColor,
        true,
      );

      y += summaryBoxHeight + 12;

      // ---------- Payment Transactions ----------
      ensureSpace(20);
      sectionHeading("Payment Transactions");

      if (payments.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...GRAY_400);
        doc.text("No payments made yet.", marginX, y);
        y += 8;
      } else {
        payments.forEach((p, idx) => {
          ensureSpace(11);
          const rowH = 10;
          doc.setFillColor(...GREEN_LIGHT);
          doc.roundedRect(marginX, y, contentWidth, rowH, 1.5, 1.5, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(...GRAY_900);
          doc.text(`${idx + 1}. ${p.label}`, marginX + 5, y + 6.5);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...GRAY_500);
          doc.text(
            p.date,
            marginX + 5 + doc.getTextWidth(`${idx + 1}. ${p.label}`) + 4,
            y + 6.5,
          );
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(...GREEN);
          doc.text(
            `${currency} ${p.amount.toLocaleString()}`,
            pageWidth - marginX - 5,
            y + 6.5,
            { align: "right" },
          );
          y += rowH + 3;
        });
      }

      if (refund) {
        y += 3;
        ensureSpace(34);
        sectionHeading("Refund");

        const refundBoxHeight = 26;
        doc.setFillColor(...WHITE);
        doc.setDrawColor(...BORDER);
        doc.roundedRect(marginX, y, contentWidth, refundBoxHeight, 2, 2, "FD");
        sy = y + 7;
        summaryRow("Amount", `${currency} ${refund.amount.toLocaleString()}`, GRAY_900, true);
        summaryRow("Reason", refund.reason);
        summaryRow("Reference ID", refund.referenceId);
        summaryRow("Date", refund.date);
        y += refundBoxHeight + 8;
      }

      // ---------- Footer on every page ----------
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(...BORDER);
        doc.line(marginX, pageHeight - 16, pageWidth - marginX, pageHeight - 16);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...GRAY_400);
        doc.text("Thank you for booking with us.", marginX, pageHeight - 10);
        doc.setTextColor(...ORANGE);
        doc.setFont("helvetica", "bold");
        doc.textWithLink("www.eventstan.com", pageWidth / 2, pageHeight - 10, {
          url: "https://www.eventstan.com",
          align: "center",
        });
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRAY_400);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginX, pageHeight - 10, {
          align: "right",
        });
      }

      doc.save(`receipt-${checkoutId}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadReceipt}
      disabled={downloading}
      className={
        className ??
        "w-full mt-5 flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      }
    >
      {downloading ? (
        "Generating PDF..."
      ) : (
        <>
          <Download className="w-4 h-4" /> Download Receipt
        </>
      )}
    </button>
  );
}