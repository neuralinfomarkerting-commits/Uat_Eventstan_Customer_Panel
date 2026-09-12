import { Package, Promotion } from "@/types";

export interface RawApiPackage {
  id: string;
  service_id?: string;
  title?: string;
  description: string;
  price: number;
  currency?: string;
  name?: string;
  isPromotional?: boolean;
  is_promotional?: boolean;
  promotional_price?: number;
  promotionalPrice?: number;
  original_price?: number;
  exact_price?: number;
  price_unit?: string;
  max_guests?: number;
  duration_hours?: number;
  is_popular?: boolean;
  isPopular?: boolean;
  inclusions?: string[];
  features?: string[];
  imageUrl?: string;
  image_url?: string;
  category?: string | { id?: string; name?: string; slug?: string };
  category_name?: string;
  category_slug?: string;
  is_rental?: boolean;
  isRental?: boolean;
  delivery_available?: boolean;
  deliveryAvailable?: boolean;
  delivery_fee?: number;
  deliveryFee?: number;
  items?: Array<{
    service?: {
      id?: string;
      title?: string;
      category?: string | { name?: string; slug?: string };
      city?: string;
      imageUrl?: string;
      vendor_name?: string;
      vendor_email?: string;
      vendor_phone?: string;
    };
  }>;
}

export function isPromotionalPackage(pkg: RawApiPackage): boolean {
  return Boolean(pkg.isPromotional ?? pkg.is_promotional);
}

export function packageToPromotion(
  pkg: RawApiPackage,
  categoryByServiceId?: Record<string, string>,
): Promotion {
  const svc = pkg.items?.[0]?.service;
  const embeddedCategory =
    typeof svc?.category === "string" ? svc.category : svc?.category?.name;
  const serviceId = pkg.service_id || svc?.id;
  const ownCategory =
    pkg.category_name ||
    (typeof pkg.category === "string" ? pkg.category : pkg.category?.name);
  const rawCategory =
    ownCategory || (serviceId && categoryByServiceId?.[serviceId]) || embeddedCategory;
  const category = (rawCategory as Promotion["category"]) || "Venue";
  const price = pkg.promotional_price ?? pkg.promotionalPrice ?? pkg.price;
  const originalPrice = pkg.original_price ?? pkg.exact_price;

  return {
    id: pkg.id,
    title: pkg.title || pkg.name || "Untitled Package",
    vendor_name: svc?.vendor_name || "",
    vendor_handle: svc?.title || "",
    category,
    image_url: pkg.imageUrl || pkg.image_url || svc?.imageUrl || "",
    description: pkg.description,
    short_desc: pkg.description,
    price,
    currency: pkg.currency,
    price_unit: pkg.price_unit || "package",
    max_guests: pkg.max_guests || 0,
    duration_hours: pkg.duration_hours || 0,
    inclusions: pkg.inclusions || pkg.features || [],
    vendor_email: svc?.vendor_email,
    vendor_phone: svc?.vendor_phone,
    badge: pkg.is_popular || pkg.isPopular ? "Popular" : undefined,
    is_featured: pkg.is_popular || pkg.isPopular || false,
    original_price: originalPrice && originalPrice !== price ? originalPrice : undefined,
    service_id: pkg.service_id || svc?.id || "",
    is_rental: Boolean(pkg.is_rental ?? pkg.isRental),
    delivery_available: Boolean(pkg.delivery_available ?? pkg.deliveryAvailable),
    delivery_fee: pkg.delivery_fee ?? pkg.deliveryFee,
  };
}