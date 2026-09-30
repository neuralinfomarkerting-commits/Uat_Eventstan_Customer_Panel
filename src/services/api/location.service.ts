

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

export const UAE_COUNTRY_ID = 1;

const isServer = typeof window === "undefined";
const API_BASE_URL = isServer
  ? `${process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")}/api/v1`
  : "/api/proxy";

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
export const locationService = LocationService.getInstance();
