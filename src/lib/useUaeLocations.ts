"use client";

import { useEffect, useRef, useState } from "react";
import { locationService, UAE_COUNTRY_ID } from "@/services/api/location.service";
import { DEFAULT_UAE_STATE, DUBAI_CITIES } from "@/lib/uaeLocations";

export interface CityOption {
  id: string;
  name: string;
}

interface UseUaeLocationsResult {
  
  stateName: string;
  
  stateId: string | null;
  
  cities: CityOption[];
  loading: boolean;
  
  usedFallback: boolean;
}

const TARGET_STATE_NAME = DEFAULT_UAE_STATE; 

export function useUaeLocations(): UseUaeLocationsResult {
  const [stateId, setStateId] = useState<string | null>(null);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;

    (async () => {
      setLoading(true);
      try {
        const states = await locationService.fetchStates(UAE_COUNTRY_ID);
        const match =
          states.find((s) => s.name.trim().toLowerCase() === TARGET_STATE_NAME.toLowerCase()) ??
          states[0] ??
          null;

        if (!match) throw new Error("No states returned by API");
        if (cancelled.current) return;
        setStateId(match.id);

        const stateCities = await locationService.fetchCities(match.id, UAE_COUNTRY_ID);
        if (cancelled.current) return;

        const options = stateCities
          .filter((c) => c.name)
          .map((c) => ({ id: c.id, name: c.name }));
        setCities(options.length > 0 ? options : DUBAI_CITIES.map((name) => ({ id: name, name })));
        setUsedFallback(options.length === 0);
      } catch (error) {
        console.error("Falling back to static Dubai locations list:", error);
        if (cancelled.current) return;
        setStateId(null);
        setCities(DUBAI_CITIES.map((name) => ({ id: name, name })));
        setUsedFallback(true);
      } finally {
        if (!cancelled.current) setLoading(false);
      }
    })();

    return () => {
      cancelled.current = true;
    };
  }, []);

  return { stateName: TARGET_STATE_NAME, stateId, cities, loading, usedFallback };
}