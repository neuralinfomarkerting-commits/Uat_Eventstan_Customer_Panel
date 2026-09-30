import type { ApiAddress } from "@/api/customerApi";


export function formatAddressById(
  addressId: string | undefined | null,
  addresses: ApiAddress[] | undefined | null,
  cityNameById?: Map<string, string>,
  stateName = "Dubai",
): string {
  if (!addressId || addressId === "-") return "-";
  const a = (addresses ?? []).find((x) => x.addressId === addressId);
  if (!a) return "-";

  const city = a.cityId ? cityNameById?.get(a.cityId) : undefined;
  const parts = [
    a.addressLine1,
    a.addressLine2,
    a.landmark ? `Near ${a.landmark}` : "",
    city,
    stateName,
    a.poBoxNumber ? `P.O. Box ${a.poBoxNumber}` : "",
  ]
    .map((p) => (p ?? "").toString().trim())
    .filter(Boolean);

  return parts.join(", ") || "-";
}
