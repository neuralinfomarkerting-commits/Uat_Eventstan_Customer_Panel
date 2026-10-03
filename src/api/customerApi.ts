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

export interface ApiAddress {
  addressId: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  poBoxNumber?: string | null;
  isDefault: boolean;
  cityId?: string | null;
  stateId?: string | null;
}

export interface AddressInput {
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  poBoxNumber?: string;
  isDefault?: boolean;
  cityId?: string;
  stateId?: string;
}

export interface ApiProfile {
  id: string;
  userId?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string | null;
  countryCode?: string;
  mobile?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  dateOfBirth?: string | null;
  profileImage?: string | null;
  status?: "ACTIVE" | "INACTIVE" | "BLOCKED";
  role: string;
  addresses?: ApiAddress[];
}

export interface UpdateProfileInput {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  countryCode?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  dateOfBirth?: string;
  profileImage?: string;
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
  return typeof window === "undefined"
    ? null
    : localStorage.getItem("es_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const authToken = token();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const err = new Error(
      body?.message || body?.error || `Request failed: ${response.status}`,
    ) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function unwrap<T>(response: T | ApiEnvelope<T>): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in (response as object)
  ) {
    return (response as ApiEnvelope<T>).data;
  }
  return response as T;
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
export interface AppliedCoupon {
  code: string;
  discountAmount: number;
  currency?: string;
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
    bookingId?: string;
    paymentType?: string;
    paymentStatus: string;
    remainingAmount: number;
    currency: string;
    amountPaid: number;
  } | null;
  checkoutItems: Array<{
    checkoutItemId?: string;
    bookingId?: string;
    packageId?: string;
    packageName?: string;
    title?: string;
    vendorName?: string;
    imageUrl?: string;
    quantity: number;
    totalAmount: number;
  }>;
  transactions?: Array<{
    amount: number;
    paymentStatus: string;
    stripePaymentIntentId?: string | null;
    currency?: string;
    paidAt?: string | null;
    createdAt?: string;
  }>;
}

export interface RefundEstimateResponse {
  eligible: boolean;
  refundAmount: number;
  currency?: string;
  deductionAmount?: number;
  deductionReason?: string;
  policyNote?: string;
}

export interface CancelBookingResponse {
  bookingId?: string;
  orderStatus?: string;
  bookingStatus?: string;
  refund?: {
    amount: number;
    currency?: string;
    referenceId?: string;
    status?: string;
  } | null;
}

export interface VendorAvailabilitySlot {
  date: string;
  isAvailable: boolean;
  slots?: string[];
}

export interface ReviewInput {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface PaymentIntentInput {
  bookingId?: string;
  paymentType: "ADVANCE" | "FULL" | "PARTIAL" | "REMAINING";
  amount?: number;
  currency?: string;
}

export interface CoreBooking {
  id: string;
  orderId: string;
  customerBookingId?: string | null;
  customerCheckoutId?: string | null;
  totalAmount: number;
  remainingDueAmount: number;
  status?: string;
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
    paymentType?: string;
    providerRef?: string | null;
    createdAt?: string;
    succeededAt?: string | null;
  }>;
}

export interface PaymentIntentResponse {
  id?: string; 
  paymentIntentId: string;
  clientSecret?: string;
  amount: number;
  currency: string;
  status?: string;
}

export interface PresignResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  fields?: Record<string, string>;
}

export const customerApi = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    google: (idToken: string) =>
      request<AuthResponse>("/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      }),
    requestRegistrationOtp: (email: string) =>
      request<{ message: string; expiresInSeconds: number; resendAfterSeconds: number }>("/auth/registration/request-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    verifyRegistrationOtp: (email: string, otp: string) =>
      request<{ verified: boolean; verificationToken: string; expiresInSeconds: number }>("/auth/registration/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      }),
    register: (name: string, email: string, phone: string, password: string, verificationToken: string, countryCode?: string) =>
      request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, countryCode, password, verificationToken }),
      }),
    me: () => request<ApiProfile>("/auth/me"),
    updateMe: (payload: UpdateProfileInput) =>
      request<ApiProfile>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    changePassword: (currentPassword: string, newPassword: string) =>
      request<{ message?: string }>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
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
  addresses: {
    add: (payload: AddressInput) =>
      request<ApiEnvelope<ApiAddress> | ApiAddress>("/auth/me/addresses", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (addressId: string, payload: AddressInput) =>
      request<ApiEnvelope<ApiAddress> | ApiAddress>(
        `/auth/me/addresses/${encodeURIComponent(addressId)}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      ),
    remove: (addressId: string) =>
      request<ApiEnvelope<{ success: boolean }> | { success: boolean }>(
        `/auth/me/addresses/${encodeURIComponent(addressId)}`,
        { method: "DELETE" },
      ),
  },
  coupons: {
    validate: async (code: string, amount: number): Promise<AppliedCoupon> => {
      const raw = unwrap(
        await request<Record<string, unknown> | ApiEnvelope<Record<string, unknown>>>(
          `/coupons/${encodeURIComponent(code)}/validate?amount=${encodeURIComponent(String(amount))}`,
        ),
      ) as Record<string, unknown>;
      if (raw?.valid === false) {
        throw new Error(
          typeof raw.message === "string" ? raw.message : "Invalid coupon code",
        );
      }
      const discount = Number(
        raw?.discountAmount ?? raw?.discount ?? raw?.discountValue,
      );
      if (!Number.isFinite(discount)) {
        console.error("Unexpected coupon validate response:", raw);
        throw new Error("Couldn't apply this coupon. Please try again.");
      }
      return {
        code: typeof raw.code === "string" ? raw.code : code,
        discountAmount: Math.max(discount, 0),
        currency: typeof raw.currency === "string" ? raw.currency : undefined,
      };
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
      request<ApiEnvelope<T>>("/customer/cart", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    get: <T = CustomerCartResponse>(userId: string) =>
      request<ApiEnvelope<T>>(`/customer/cart/${encodeURIComponent(userId)}`),
    update: <T = CustomerCartItemResponse>(
      cartItemId: string,
      payload: { userId: string; quantity: number; days?: number },
    ) =>
      request<ApiEnvelope<T>>(
        `/customer/cart/${encodeURIComponent(cartItemId)}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      ),
    remove: (cartItemId: string, userId: string) =>
      request<ApiEnvelope<{ success: boolean }>>(
        `/customer/cart/${encodeURIComponent(cartItemId)}`,
        {
          method: "DELETE",
          body: JSON.stringify({ userId }),
        },
      ),
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
  }) =>
    request<ApiEnvelope<T>>("/customer/book-now", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
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
    paymentMethod?: "STRIPE";
    stripePaymentIntentId?: string;
    message?: string;
  }) =>
    request<ApiEnvelope<T>>("/customer/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  bookings: {
    list: async (userId: string) => {
      const response = await request<
        MyBookingResponse[] | ApiEnvelope<MyBookingResponse[]>
      >(`/customer/my-bookings/${encodeURIComponent(userId)}`);
      const unwrapped =
        response && typeof response === "object" && "data" in response
          ? (response as ApiEnvelope<MyBookingResponse[]>).data
          : (response as MyBookingResponse[]);
      return unwrapped ?? [];
    },
    listMine: async (): Promise<CoreBooking[]> => {
      const res = await request<CoreBooking[] | ApiEnvelope<CoreBooking[]>>("/bookings");
      const rows = res && typeof res === "object" && "data" in res ? (res as ApiEnvelope<CoreBooking[]>).data : res;
      return Array.isArray(rows) ? rows : [];
    },
    resolveCore: async (refs: string[]): Promise<CoreBooking | undefined> => {
      const wanted = new Set(refs.filter(Boolean).map((r) => r.trim().toUpperCase()));
      const rows = await customerApi.bookings.listMine();
      return rows.find((b) =>
        [b.id, b.orderId, b.customerBookingId, b.customerCheckoutId]
          .filter((v): v is string => !!v)
          .some((v) => wanted.has(v.toUpperCase())),
      );
    },
    get: <T = MyBookingResponse>(id: string) =>
      request<T | ApiEnvelope<T>>(`/bookings/${encodeURIComponent(id)}`).then(
        unwrap,
      ),
    refundEstimate: <T = RefundEstimateResponse>(id: string) =>
      request<T | ApiEnvelope<T>>(
        `/bookings/${encodeURIComponent(id)}/refund-estimate`,
      ).then(unwrap),
    cancel: <T = CancelBookingResponse>(id: string, reason: string) =>
      request<T | ApiEnvelope<T>>(
        `/bookings/${encodeURIComponent(id)}/cancel`,
        {
          method: "PATCH",
          body: JSON.stringify({ reason }),
        },
      ).then(unwrap),
    customerConfirm: <T = MyBookingResponse>(id: string) =>
      request<T | ApiEnvelope<T>>(
        `/bookings/${encodeURIComponent(id)}/customer-confirm`,
        {
          method: "PATCH",
        },
      ).then(unwrap),
  },
  availability: {
    getVendorAvailability: <T = VendorAvailabilitySlot[]>(vendorId: string) =>
      request<T | ApiEnvelope<T>>(
        `/availability/vendors/${encodeURIComponent(vendorId)}`,
      ).then(unwrap),
  },
  reviews: {
    submit: <T = unknown>(payload: ReviewInput) =>
      request<T | ApiEnvelope<T>>("/reviews", {
        method: "POST",
        body: JSON.stringify(payload),
      }).then(unwrap),
  },
  payments: {
    createIntent: (payload: PaymentIntentInput) =>
      request<ApiEnvelope<PaymentIntentResponse> | PaymentIntentResponse>(
        "/payments/intent",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      ).then(unwrap),
    confirm: (paymentIntentId: string) =>
      request<ApiEnvelope<unknown> | unknown>(
        `/payments/${encodeURIComponent(paymentIntentId)}/confirm`,
        { method: "PATCH" },
      )
        .then(unwrap)
        .catch((err: Error & { status?: number }) => {
          if (err?.status === 404 || err?.status === 405) return undefined;
          throw err;
        }),
    verify: (paymentId: string) =>
      request<ApiEnvelope<unknown> | unknown>(
        `/payments/${encodeURIComponent(paymentId)}/verify`,
        { method: "POST" },
      ).then(unwrap),
  },
  uploads: {
    presignImage: (
      folder = "customers",
      fileName?: string,
      contentType?: string,
    ) =>
      request<ApiEnvelope<PresignResponse> | PresignResponse>(
        `/uploads/images/presign?folder=${encodeURIComponent(folder)}`,
        {
          method: "POST",
          body: JSON.stringify({ fileName, contentType }),
        },
      ).then(unwrap),
  },

  leads: {
    submitUserLead: <T = unknown>(payload: UserLeadInput) =>
      request<T>("/user-leads", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    submitVendorLead: <T = unknown>(payload: VendorLeadInput) =>
      request<T>("/vendor-leads", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
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
        const categories = await request<ApiCategory[]>(
          "/master-data/categories",
        );
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

export function findPriceUnitId(
  units: PriceUnit[],
  priceUnitLabel: string,
): string | undefined {
  const normalize = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "");
  const target = normalize(priceUnitLabel || "per event");
  const match = units.find(
    (u) => normalize(u.code) === target || normalize(u.label) === target,
  );
  return match?.id;
}

export async function uploadImage(file: File, folder = "customers") {
  const body = new FormData();
  body.append("file", file);
  return request<{
    bucket: string;
    key: string;
    url: string;
    contentType: string;
    size: number;
  }>(`/uploads/images?folder=${encodeURIComponent(folder)}`, {
    method: "POST",
    body,
  });
}

export const getServices = () => request<Service[]>("/services");
export const getService = (id: string) =>
  request<Service>(`/services/${encodeURIComponent(id)}`);
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
  const events = await request<ApiEventMaster[]>("/event-masters?status=active");
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
