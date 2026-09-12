"use client";
import { useState } from "react";
import { useCart } from "@/lib/CartContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAddToCart(pkg: any, service: any) {
  const { items, addPackage } = useCart();
  const [showConfigure, setShowConfigure] = useState(false);

  const inCart = items.some(
    (i) => i.id === `pkg-${pkg.id}` || i.pkg?.id === pkg.id,
  );
  const isPerEvent = String(pkg.price_unit || "").toLowerCase() === "per event";

  const handleAddToCart = () => {
    if (inCart) return;
    if (isPerEvent) {
      addPackage(pkg, service, 1);
    } else {
      setShowConfigure(true);
    }
  };

  return {
    inCart,
    isPerEvent,
    showConfigure,
    setShowConfigure,
    handleAddToCart,
  };
}
