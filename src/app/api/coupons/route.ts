import { NextResponse } from "next/server";

// TODO(backend): admin.eventstan.com/api/proxy/coupons needs a SUPER_ADMIN
// bearer token to authorize. The token below is short-lived (~24h) — once it
// expires this will start 401'ing again and needs to be refreshed in .env
// (ADMIN_COUPONS_TOKEN). Falling back to a static list if the upstream call
// fails so the coupon UI keeps working either way.
const STATIC_COUPONS = [
  {
    id: "cmqwka2bp0024iy888xfh3euu",
    code: "EVENT10",
    type: "PERCENTAGE",
    value: 10,
    maxDiscountAmount: 500,
    currency: "AED",
    minOrderAmount: 5000,
    active: true,
    expiresAt: "2027-01-31T00:00:00.000Z",
    createdAt: "2026-06-27T16:15:30.374Z",
  },
];

export async function GET() {
  const token = process.env.ADMIN_COUPONS_TOKEN;

  if (!token) {
    return NextResponse.json(STATIC_COUPONS);
  }

  try {
    const response = await fetch("https://admin.eventstan.com/api/proxy/coupons", {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(`Upstream coupons request failed: ${response.status}. Falling back to static list.`);
      return NextResponse.json(STATIC_COUPONS);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch coupons from upstream, falling back to static list:", error);
    return NextResponse.json(STATIC_COUPONS);
  }
}
