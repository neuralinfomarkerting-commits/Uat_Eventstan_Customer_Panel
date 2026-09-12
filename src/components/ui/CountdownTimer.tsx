"use client";
import { useEffect, useState } from "react";

export default function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    queueMicrotask(() => setNow(Date.now()));
  }, [expiresAt]);

  if (now == null) return null;

  const end = new Date(expiresAt).getTime();
  const diff = Math.max(0, end - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return (
    <div className="flex items-center gap-1 text-orange-500 text-xs font-semibold">
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0114 0z"
        />
      </svg>
      {days > 0 ? `${days}d left` : "Ends today"}
    </div>
  );
}
