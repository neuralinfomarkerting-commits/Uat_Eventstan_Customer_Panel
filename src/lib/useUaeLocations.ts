"use client";

import { useEffect, useRef, useState } from "react";
import { locationService, UAE_COUNTRY_ID } from "@/services/api/location.service";
import { DEFAULT_UAE_STATE, DUBAI_CITIES } from "@/lib/uaeLocations";

interface UseUaeLocationsResult {
  /** Display name of the fixed state (e.g. "Dubai"). Always populated. */
  stateName: string;
  /** Resolved master-data id for the state, once loaded from the API. */
  stateId: string | null;
  /** City names for the resolved state, for the searchable dropdown. */
  cities: string[];
  loading: boolean;
  /** True if we had to fall back to the static local list. */
  usedFallback: boolean;
}

// The platform currently only operates in one emirate. We fetch the real
// list of states from the API and pick the one matching this name (so if
// the backend ever renames/re-ids it, this still resolves correctly);
// its cities are then fetched from the API too. If either call fails,
// we fall back to the static DUBAI_CITIES list so the form still works.
const TARGET_STATE_NAME = DEFAULT_UAE_STATE; // "Dubai"

export function useUaeLocations(): UseUaeLocationsResult {
  const [stateId, setStateId] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
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

        const names = stateCities.map((c) => c.name).filter(Boolean);
        setCities(names.length > 0 ? names : DUBAI_CITIES);
        setUsedFallback(names.length === 0);
      } catch (error) {
        console.error("Falling back to static Dubai locations list:", error);
        if (cancelled.current) return;
        setStateId(null);
        setCities(DUBAI_CITIES);
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
