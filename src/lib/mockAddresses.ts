import { Address } from "@/components/profile/types";

// TODO(backend): replace this seed + the localStorage-backed helpers below with
// real calls once the address_id-based endpoints exist, e.g.
//   GET  /api/v1/customer/addresses            -> Address[]
//   POST /api/v1/customer/addresses             -> Address
//   PATCH /api/v1/customer/addresses/:id/default -> void
// Keeping a single seed + storage key here so /my-profile and the Book Now
// modal always see the same list while we're frontend-only.

export const MOCK_ADDRESSES_SEED: Address[] = [
  {
    addressId: "ADDRESS_ID_001",
    addressLine1: "Apartment 1204, Building A",
    addressLine2: "Downtown Dubai",
    landmark: "Near Dubai Mall",
    poBoxNumber: "12345",
    state: "Dubai",
    city: "Downtown Dubai",
    isDefault: true,
  },
  {
    addressId: "ADDRESS_ID_002",
    addressLine1: "Villa 25, Street 10",
    addressLine2: "Jumeirah",
    landmark: "Near Jumeirah Beach",
    poBoxNumber: "67890",
    state: "Dubai",
    city: "Jumeirah",
    isDefault: false,
  },
];

const STORAGE_KEY = "eventstan.mock_addresses";

export function loadMockAddresses(): Address[] {
  if (typeof window === "undefined") return MOCK_ADDRESSES_SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_ADDRESSES_SEED;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : MOCK_ADDRESSES_SEED;
  } catch {
    return MOCK_ADDRESSES_SEED;
  }
}

export function saveMockAddresses(addresses: Address[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  } catch {
    // ignore quota/serialization errors in this mock layer
  }
}

export function getDefaultAddress(addresses: Address[]): Address | null {
  return addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
}
