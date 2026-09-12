"use client";
import { useEffect, useState } from "react";
import { getServices, getPackages, customerApi, ApiCategory } from "@/api/customerApi";
import { Service, Package } from "@/types";

export function useMarketplace() {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([getServices(), getPackages(), customerApi.masterData.getCategories()])
      .then(([s, p, c]) => {
        if (!active) return;
        setServices(s);
        setPackages(p);
        setCategories(c);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load data");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { services, packages, categories, loading, error };
}