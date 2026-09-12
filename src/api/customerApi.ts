import { Package, Review, Service } from "@/types";

const isServer = typeof window === "undefined";
const API_BASE_URL = isServer
  ? `${process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")}/api/v1`
  : "/api/proxy";

export { API_BASE_URL };

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: ApiUser;
  welcomeEmailSent?: boolean;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CustomerCartItemResponse {
  cartItemId: string;
  userId: string;
  packageId: string;
  quantity: number;
  days: number;
  priceUnitId: string;
  transportFee: number | null;
  unitPrice: number;
  subtotal: number;
  totalAmount: number;
}

export interface CustomerCartResponse {
  items: CustomerCartItemResponse[];
  itemCount: number;
  estimatedTotal: number;
}

export interface CustomerBookingResponse {
  bookingId: string;
  userId: string;
  packageId: string;
  vendorId: string;
  eventDate: string;
  eventType: string;
  guestCount: number;
  unitPrice: number;
  priceUnit: string;
  totalPrice: number;
  bookingStatus: string;
  paymentStatus: string;
}

export interface CustomerCheckoutItemResponse {
  bookingId: string;
  packageId: string;
  vendorId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  priceUnit: string;
  totalPrice: number;
}

export interface CustomerCheckoutResponse {
  checkoutId: string;
  orderId: string;
  userId: string;
  bookingCount: number;
  eventDate: string;
  eventType: string;
  guestCount: number;
  paymentMethod: string;
  paymentStatus: string;
  bookingStatus: string;
  subtotal: number;
  totalAmount: number;
  items: CustomerCheckoutItemResponse[];
}

function token() {
  return typeof window === "undefined" ? null : localStorage.getItem("es_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const authToken = token();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || body?.error || `Request failed: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export interface BudgetRangeInput {
  min: number;
  max: number;
  currency: string;
}

export interface UserLeadInput {
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  preferredEventDate?: string;
  expectedGuestCount?: number;
  budgetRange?: BudgetRangeInput;
  servicesNeeded?: string[];
  additionalDetails?: string;
}

export interface VendorLeadInput {
  businessName: string;
  yourName: string;
  email: string;
  phone?: string;
  websiteSocialMedia?: string[];
  serviceCategoryId: string;
  cityId: string;
  yearsOfExperience?: number;
  message?: string;
}

export interface Country {
  id: number;
  code: string;
  name: string;
  defaultCurrency: string;
  flag: string;
  currencySymbol: string;
  phoneCode: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  name: string;
  countryId?: number;
  status?: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  image: string;
  showInHomePage: boolean;
  isActive: boolean;
  createdAt: string;
}

const FALLBACK_COUNTRIES: Country[] = [
  {
    id: 1,
    code: "AE",
    name: "United Arab Emirates (UAE)",
    defaultCurrency: "UAE DIRHAM",
    flag: "🇦🇪",
    currencySymbol: "AED",
    phoneCode: "+971",
    status: "Active",
    createdAt: "",
    updatedAt: "",
  },
];

const FALLBACK_CITIES: City[] = [
  { id: "dubai", name: "Dubai" },
  { id: "abu-dhabi", name: "Abu Dhabi" },
  { id: "sharjah", name: "Sharjah" },
  { id: "ajman", name: "Ajman" },
  { id: "ras-al-khaimah", name: "Ras Al Khaimah" },
  { id: "fujairah", name: "Fujairah" },
  { id: "umm-al-quwain", name: "Umm Al Quwain" },
  { id: "al-ain", name: "Al Ain" },
];

const FALLBACK_CATEGORIES: ApiCategory[] = [
  {
    id: "venue",
    name: "Venue",
    slug: "venue",
    parentId: null,
    image: "",
    showInHomePage: true,
    isActive: true,
    createdAt: "",
  },
  {
    id: "decor",
    name: "Decor",
    slug: "decor",
    parentId: null,
    image: "",
    showInHomePage: true,
    isActive: true,
    createdAt: "",
  },
  {
    id: "catering",
    name: "Catering",
    slug: "catering",
    parentId: null,
    image: "",
    showInHomePage: true,
    isActive: true,
    createdAt: "",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    slug: "entertainment",
    parentId: null,
    image: "",
    showInHomePage: true,
    isActive: true,
    createdAt: "",
  },
  {
    id: "rentals",
    name: "Rentals",
    slug: "rentals",
    parentId: null,
    image: "",
    showInHomePage: true,
    isActive: true,
    createdAt: "",
  },
];

export interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  maxDiscountAmount?: number | null;
  currency: string;
  minOrderAmount?: number | null;
  active: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface MyBookingResponse {
  checkoutId?: string;
  bookingId: string;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  guestCount?: number;
  address?: { addressId: string } | null;
  payment?: {
    paymentId?: string;
    paymentType?: string;
    paymentStatus: string;
    remainingAmount: number;
    currency: string;
    amountPaid: number;
  } | null;
  checkoutItems: Array<{
    checkoutItemId?: string;
    packageName?: string;
    title?: string;
    vendorName?: string;
    imageUrl?: string;
    quantity: number;
    totalAmount: number;
  }>;
}

export const customerApi = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    register: (name: string, email: string, phone: string, password: string) =>
      request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify({ name, email, phone, password }) }),
    me: () => request<ApiUser>("/auth/me"),
    updateMe: (payload: { name?: string; phone?: string | null }) =>
      request<ApiUser>("/auth/me", { method: "PATCH", body: JSON.stringify(payload) }),
    logout: () => request<{ loggedOut: boolean }>("/auth/logout", { method: "POST" }),
    forgotPassword: (email: string) =>
      request<{ message?: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    resetPassword: (token: string, password: string) =>
      request<{ message?: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      }),
  },
  coupons: {
    // Coupons live on a separate admin host, so this goes through our own
    // /api/coupons route (src/app/api/coupons/route.ts), which fetches it
    // server-side to avoid the browser CORS block on a direct cross-origin call.
    list: async (): Promise<Coupon[]> => {
      const response = await fetch("/api/coupons", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Failed to load coupons: ${response.status}`);
      return response.json();
    },
  },
  cart: {
    add: <T = CustomerCartItemResponse>(payload: {
      userId: string;
      packageId: string;
      quantity: number;
      days: number;
      priceUnitId: string;
      transportFee?: number;
    }) =>
      request<ApiEnvelope<T>>("/customer/cart", { method: "POST", body: JSON.stringify(payload) }),
    get: <T = CustomerCartResponse>(userId: string) =>
      request<ApiEnvelope<T>>(`/customer/cart/${encodeURIComponent(userId)}`),
    update: <T = CustomerCartItemResponse>(
      cartItemId: string,
      payload: { userId: string; quantity: number; days?: number },
    ) =>
      request<ApiEnvelope<T>>(`/customer/cart/${encodeURIComponent(cartItemId)}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (cartItemId: string, userId: string) =>
      request<ApiEnvelope<{ success: boolean }>>(`/customer/cart/${encodeURIComponent(cartItemId)}`, {
        method: "DELETE",
        body: JSON.stringify({ userId }),
      }),
  },
  bookNow: <T = CustomerBookingResponse>(payload: {
    userId: string;
    packageId: string;
    quantity: number;
    days: number;
    priceUnitId: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    eventTypeId: string;
    guestCount: number;
    addressId: string;
    transportFee?: number;
    couponCode?: string;
    paymentType: "PARTIAL" | "FULL";
    stripePaymentIntentId?: string;
    message?: string;
  }) => request<ApiEnvelope<T>>("/customer/book-now", { method: "POST", body: JSON.stringify(payload) }),
  checkout: <T = CustomerCheckoutResponse>(payload: {
    userId: string;
    cartItemIds: string[];
    eventDate: string;
    startTime: string;
    endTime: string;
    eventTypeId: string;
    guestCount: number;
    addressId: string;
    couponCode?: string;
    paymentType: "PARTIAL" | "FULL";
    stripePaymentIntentId?: string;
    message?: string;
  }) => request<ApiEnvelope<T>>("/customer/checkout", { method: "POST", body: JSON.stringify(payload) }),
    bookings: {
    list: async (userId: string) => {
      const response = await request<MyBookingResponse[] | ApiEnvelope<MyBookingResponse[]>>(
        `/customer/my-bookings/${encodeURIComponent(userId)}`
      );
      const unwrapped =
        response && typeof response === "object" && "data" in response
          ? (response as ApiEnvelope<MyBookingResponse[]>).data
          : (response as MyBookingResponse[]);
      return unwrapped ?? [];
    },
    cancel: <T>(id: string, reason: string) =>
      request<T>(`/bookings/${id}/cancel`, { method: "PATCH", body: JSON.stringify({ reason }) }),
  },
    
    
  //   bookings: {
  //   list: async <T>(userId?: string) => {
  //     const response = await request<T | ApiEnvelope<T>>("/bookings");
  //     const unwrapped =
  //       response && typeof response === "object" && "data" in response
  //         ? (response as ApiEnvelope<T>).data
  //         : (response as T);
  //     return (unwrapped ?? ([] as unknown as T));
  //   },
  //   cancel: <T>(id: string, reason: string) =>
  //     request<T>(`/bookings/${id}/cancel`, { method: "PATCH", body: JSON.stringify({ reason }) }),
  // },
  leads: {
    submitUserLead: <T = unknown>(payload: UserLeadInput) =>
      request<T>("/user-leads", { method: "POST", body: JSON.stringify(payload) }),
    submitVendorLead: <T = unknown>(payload: VendorLeadInput) =>
      request<T>("/vendor-leads", { method: "POST", body: JSON.stringify(payload) }),
  },
  masterData: {
    getCountries: async (): Promise<Country[]> => {
      try {
        const countries = await request<Country[]>("/master-data/countries");
        return countries.filter((c) => c.status === "Active");
      } catch (err) {
        console.error("Error fetching countries:", err);
        return FALLBACK_COUNTRIES;
      }
    },
    getCities: async (): Promise<City[]> => {
      return FALLBACK_CITIES;
    },
    getCategories: async (): Promise<ApiCategory[]> => {
      try {
        const categories = await request<ApiCategory[]>("/master-data/categories");
        return categories.filter((c) => c.isActive);
      } catch (err) {
        console.error("Error fetching categories:", err);
        return FALLBACK_CATEGORIES;
      }
    },
    getPriceUnits: async (): Promise<PriceUnit[]> => {
      const units = await request<PriceUnit[]>("/master-data/price-units");
      return units.filter((u) => u.isActive);
    },
  },
};

export interface PriceUnit {
  id: string;
  code: string;
  label: string;
  isActive: boolean;
  sortOrder: number;
  requireRange: boolean;
}

// Matches a package's `priceUnit` label (e.g. "per event") to the
// corresponding PriceUnitMaster row, the same way the backend does when
// validating AddToCartDto.priceUnitId (normalized code/label match).
export function findPriceUnitId(units: PriceUnit[], priceUnitLabel: string): string | undefined {
  const normalize = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "");
  const target = normalize(priceUnitLabel || "per event");
  const match = units.find((u) => normalize(u.code) === target || normalize(u.label) === target);
  return match?.id;
}

export async function uploadImage(file: File, folder = "customers") {
  const body = new FormData();
  body.append("file", file);
  return request<{ bucket: string; key: string; url: string; contentType: string; size: number }>(
    `/uploads/images?folder=${encodeURIComponent(folder)}`,
    { method: "POST", body },
  );
}

export const getServices = () => request<Service[]>("/services");
export const getService = (id: string) => request<Service>(`/services/${encodeURIComponent(id)}`);
export const getPackages = () => request<Package[]>("/packages");
export const getReviews = () => request<Review[]>("/reviews");
export const getCategories = () => customerApi.masterData.getCategories();

export interface ApiBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  status: string;
  isFeatured: boolean;
  authorName: string;
  authorAvatar?: string;
  authorBio?: string;
  publishedAt: string;
  readTime: number;
  createdAt?: string;
  updatedAt?: string;
  relatedServiceIds?: string[];
  relatedPackageIds?: string[];
}

export const getBlogs = () => request<ApiBlogPost[]>("/blogs");

export const getBlogBySlug = async (slug: string) => {
  const posts = await getBlogs();
  return posts.find((p) => p.slug === slug) ?? null;
};

export interface ApiPreviousWorkGalleryImage {
  url: string;
}

export interface ApiPreviousWork {
  id: string;
  categoryId: string;
  categoryName: string;
  subcategoryName: string;
  mainImage: string;
  gallery: ApiPreviousWorkGalleryImage[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const getPreviousWorks = async (): Promise<ApiPreviousWork[]> => {
  const works = await request<ApiPreviousWork[]>("/our-previous-work");
  return works.filter((w) => w.status === "publish");
};

export interface ApiTestimonial {
  id: string;
  customerName: string;
  image: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const getTestimonials = async (): Promise<ApiTestimonial[]> => {
  const testimonials = await request<ApiTestimonial[]>("/testimonials");
  return testimonials.filter((t) => t.status === "active");
};

export interface ApiEventMaster {
  id: string;
  eventName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const getEventMasters = async (): Promise<ApiEventMaster[]> => {
  const events = await request<ApiEventMaster[]>("/event-masters");
  return events.filter((e) => e.status === "active");
};

export async function getMarketplaceData() {
  const [services, packages, reviews, categories] = await Promise.all([
    getServices(),
    getPackages(),
    getReviews(),
    getCategories(),
  ]);
  return { services, packages, reviews, categories };
}