"use client";

import { useEffect, useState } from "react";
import { getMarketplaceData } from "@/api/customerApi";
import { Package, Review, Service } from "@/types";

interface MarketplaceState {
  services: Service[];
  packages: Package[];
  reviews: Review[];
  loading: boolean;
  error: string;
}

export function useMarketplaceData() {
  const [state, setState] = useState<MarketplaceState>({
    services: [],
    packages: [],
    reviews: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    let active = true;

    getMarketplaceData()
      .then((data) => {
        if (!active) return;
        setState({ ...data, loading: false, error: "" });
      })
      .catch((error: Error) => {
        if (!active) return;
        setState((current) => ({
          ...current,
          loading: false,
          error: error.message || "Unable to load marketplace data.",
        }));
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
