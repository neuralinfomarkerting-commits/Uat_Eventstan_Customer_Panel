export interface Service {
  id: string;
  vendorId?: string;
  slug?: string;
  title: string;
  category: "Venue" | "Decor" | "Catering" | "Entertainment";
  description: string;
  location: string;
  price_min: number;
  price_max: number;
  price_unit: string;
  rating: number;
  review_count: number;
  image_url: string;
  vendor_name: string;
  vendor_email: string;
  vendor_phone: string;
  vendor_phone_country_code?: string;
  tags: string[];
  gallery: string[];
  features: string[];
  created_at: string;
  showOnPromotionalPage?: boolean;
}

export interface Package {
  id: string;
  service_id: string;
  title: string;
  description: string;
  price: number;
  inclusions: string[];
  max_guests: number;
  duration_hours: number;
  is_popular?: boolean;
  // Rental-specific fields (present on rental packages from the /packages API).
  is_rental?: boolean;
  isRental?: boolean;
  min_days?: number;
  minDays?: number;
  max_days?: number;
  maxDays?: number;
  delivery_available?: boolean;
  deliveryAvailable?: boolean;
  pickup_available?: boolean;
  pickupAvailable?: boolean;
  delivery_fee?: number;
  deliveryFee?: number;
  rental_location?: string;
  rentalLocation?: string;
}

export interface Booking {
  id: string;
  service_id?: string;
  package_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_date: string;
  event_type: string;
  guest_count: number;
  message: string;
  status: "pending" | "confirmed" | "cancelled";
  total_price: number;
  created_at: string;
}

export interface Review {
  id: string;
  service_id: string;
  reviewer_name: string;
  reviewer_avatar: string;
  rating: number;
  comment: string;
  event_type: string;
  location: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  type: "package" | "service";
  title: string;
  subtitle: string;
  price: number;
  image_url: string;
  pkg?: Package;
  service?: Service;
  cartItemId?: string;
  quantity?: number;
  /** For rental-style packages: number of units rented (e.g. 5 chairs). */
  unitQuantity?: number;
  /** For rental-style packages: number of days the units are rented for. */
  days?: number;
  /** For rental-style packages with delivery: drop-off address. */
  deliveryLocation?: string;
  /** For rental-style packages with delivery: computed transport fee, added on top of the item price. */
  transportFee?: number;
}



export interface Promotion {
  id: string;
  title: string;
  vendor_name: string;
  vendor_handle: string;
  category: "Venue" | "Decor" | "Catering" | "Entertainment" | "Rentals";
  image_url: string;
  description: string;
  short_desc: string;
  price: number;
  currency?: string;
  price_unit: string;
  max_guests: number;
  duration_hours: number;
  inclusions: string[];
  vendor_email?: string;
  vendor_phone?: string;
  min_days?: number;
  max_days?: number;
  badge?: string;
  is_featured?: boolean;
  expires_at?: string;
  original_price?: number;
  service_id: string;
  // Rental-specific fields (present on rental packages from the /packages API).
  is_rental?: boolean;
  delivery_available?: boolean;
  delivery_fee?: number;
}