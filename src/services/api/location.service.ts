// services/api/location.service.ts
//
// Fetches states/cities from the real master-data API:
//   GET /master-data/states?countryId=<id>
//   GET /master-data/cities?countryId=<id>&stateId=<id>
//
// Same client/server split + rewrite-proxy pattern used by category.service.ts:
// client-side calls go through /api/proxy (see next.config.ts rewrites) to
// avoid CORS, server-side calls hit the real API directly.

export interface State {
  id: string;
  countryId: number;
  name: string;
  code: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface City {
  id: string;
  stateId: string;
  countryId?: number;
  name: string;
  code?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

// UAE's country id in the master-data service.
export const UAE_COUNTRY_ID = 1;

const isServer = typeof window === "undefined";
const API_BASE_URL = isServer
  ? `${process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "https://api.eventstan.com"}/api/v1`
  : "/api/proxy";

// Some master-data endpoints return a bare array, others wrap the payload in
// { data: [...] } — handle both so this doesn't silently break either way.
function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

export class LocationService {
  private static instance: LocationService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = API_BASE_URL;
  }

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Fetch all states/emirates for a given country (defaults to UAE).
   */
  async fetchStates(countryId: number = UAE_COUNTRY_ID): Promise<State[]> {
    try {
      const response = await fetch(`${this.baseUrl}/master-data/states?countryId=${countryId}`, {
        headers: { accept: "*/*" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch states: ${response.status}`);
      }

      const payload = await response.json();
      return unwrapList<State>(payload);
    } catch (error) {
      console.error("Error fetching states:", error);
      throw error;
    }
  }

  /**
   * Fetch all cities for a given state (and its country).
   */
  async fetchCities(stateId: string, countryId: number = UAE_COUNTRY_ID): Promise<City[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/master-data/cities?countryId=${countryId}&stateId=${stateId}`,
        { headers: { accept: "*/*" } }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch cities: ${response.status}`);
      }

      const payload = await response.json();
      return unwrapList<City>(payload);
    } catch (error) {
      console.error("Error fetching cities:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const locationService = LocationService.getInstance();
