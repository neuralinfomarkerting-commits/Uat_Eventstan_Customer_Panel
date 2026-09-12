"use client";

import toast from "react-hot-toast";

/**
 * Success toast — same as admin/vendor panel (default react-hot-toast styling).
 * Stays visible for 5 seconds.
 */
export function showSuccess(message: string) {
  toast.success(message, { duration: 5000 });
}

/**
 * Error toast — same as admin/vendor panel (default react-hot-toast styling).
 * Stays visible for 10 seconds.
 */
export function showError(message: string) {
  toast.error(message, { duration: 10000 });
}
