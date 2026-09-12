"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, X, ImageOff } from "lucide-react";
import { customerApi, Coupon, findPriceUnitId } from "@/api/customerApi";
import { useAuth } from "@/lib/AuthContext";
import CurrencySymbol from "@/components/ui/CurrencySymbol";
import Confetti from "@/components/ui/Confetti";
import { showError, showSuccess } from "@/lib/toast";
import { Address, AddressFormData, emptyAddressForm } from "@/components/profile/types";
import { loadMockAddresses, saveMockAddresses, getDefaultAddress } from "@/lib/mockAddresses";
import AddressModal from "@/components/profile/AddressModal";
import StripeGatewayModal from "@/components/ui/StripeGatewayModal";

const PARTIAL_PAYMENT_PERCENT = 50;
type PaymentType = "partial" | "full";

interface BookingDraft {
  userId: string;
  packageId: string;
  isPromotional: boolean;
  title: string;
  vendorName?: string;
  category?: string;
  imageUrl?: string;
  basePrice: number;
  priceUnit: string;
  isRental: boolean;
  isPerDay: boolean;
  isPerPerson: boolean;
  minPersons: number;
  maxPersons: number | null;
  fullName: string;
  email: string;
  phone: string;
  eventDate: string;
  eventDateDisplay: string;
  eventStartTime: string;
  eventEndTime: string;
  eventType: string;
  numGuests: string;
  quantity?: number;
  numDays?: number;
  eventTypeId?: string;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-800 font-medium text-right max-w-[60%] break-words">{value}</span>
    </div>
  );
}

export default function PaymentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [draft, setDraft] = useState<BookingDraft | null | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("bookingDraft");
      setDraft(raw ? (JSON.parse(raw) as BookingDraft) : null);
    } catch {
      setDraft(null);
    }
  }, []);

  useEffect(() => {
    // AuthProvider takes a tick to rehydrate the session from localStorage on
    // a hard refresh, so `user` starts out null even for a logged-in person.
    // Only redirect once that check has actually finished.
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=${encodeURIComponent("/payment")}`);
    }
  }, [user, authLoading, router]);

  // Quantity/duration are chosen up-front in the booking modal — carry those
  // values over here instead of resetting back to 1.
  const [quantity, setQuantity] = useState(1);
  const [numDays, setNumDays] = useState(1);
  useEffect(() => {
    if (!draft) return;
    if (draft.quantity) setQuantity(draft.quantity);
    if (draft.numDays) setNumDays(draft.numDays);
  }, [draft]);
  const [message, setMessage] = useState("");
  const [payment, setPayment] = useState<PaymentType>("full");
  const [step, setStep] = useState<"form" | "summary">("form");

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormData>(emptyAddressForm);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    const loaded = loadMockAddresses();
    setAddresses(loaded);
    setSelectedAddressId(getDefaultAddress(loaded)?.addressId ?? "");
  }, []);

  const selectedAddress = addresses.find((a) => a.addressId === selectedAddressId) ?? null;

  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
    setShowAddressForm(true);
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddressId(addr.addressId);
    setAddressForm({ ...addr });
    setShowAddressForm(true);
  };

  const handleAddressFormChange = (field: keyof AddressFormData, value: string | boolean) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.addressLine1.trim()) {
      showError("Address Line 1 is required");
      return;
    }
    if (!addressForm.city.trim()) {
      showError("City is required");
      return;
    }
    setSavingAddress(true);
    let updated: Address[];
    let targetId = editingAddressId;
    if (editingAddressId) {
      updated = addresses.map((a) =>
        a.addressId === editingAddressId ? ({ ...addressForm, addressId: editingAddressId } as Address) : a
      );
    } else {
      targetId = `ADDRESS_ID_${Date.now()}`;
      const newAddr: Address = { ...addressForm, addressId: targetId } as Address;
      updated = [...addresses, newAddr];
    }
    if (addressForm.isDefault && targetId) {
      updated = updated.map((a) => ({ ...a, isDefault: a.addressId === targetId }));
    }
    setAddresses(updated);
    saveMockAddresses(updated);
    setSelectedAddressId(targetId ?? selectedAddressId);
    setSavingAddress(false);
    setShowAddressForm(false);
    setShowAddressPicker(false);
    showSuccess(editingAddressId ? "Address updated!" : "Address added!");
  };

  const [couponInput, setCouponInput] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponsLoadError, setCouponsLoadError] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const loadCoupons = (): Promise<Coupon[]> => {
    setCouponsLoading(true);
    setCouponsLoadError(false);
    return customerApi.coupons
      .list()
      .then((list) => {
        const safeList = Array.isArray(list) ? list : [];
        setCoupons(safeList);
        return safeList;
      })
      .catch((err) => {
        console.error("Failed to load coupons:", err);
        setCoupons([]);
        setCouponsLoadError(true);
        return [] as Coupon[];
      })
      .finally(() => {
        setCouponsLoading(false);
      });
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [showGateway, setShowGateway] = useState(false);

  if (draft === undefined || authLoading || (!user && !authLoading)) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">Loading…</div>;
  }

  if (draft === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Nothing to pay for yet</h1>
        <p className="text-gray-500 mb-6">
          Start a booking from a service, package, or promotion and hit "Continue" to land here.
        </p>
        <button
          onClick={() => router.push("/services")}
          className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
        >
          Browse Services
        </button>
      </div>
    );
  }

  const billingQuantity = draft.isPerPerson
    ? Math.max(1, Number(draft.numGuests) || 1)
    : draft.isPerDay
      ? numDays
      : 1;
  const totalPrice = draft.basePrice * billingQuantity * (draft.isRental ? quantity : 1);

  const computeCouponDiscount = (coupon: Coupon, amount: number) => {
    if (coupon.type === "PERCENTAGE") {
      const raw = Math.round((amount * coupon.value) / 100);
      return coupon.maxDiscountAmount ? Math.min(raw, coupon.maxDiscountAmount) : raw;
    }
    return Math.min(coupon.value, amount);
  };

  const couponDiscount = payment === "full" && appliedCoupon ? computeCouponDiscount(appliedCoupon, totalPrice) : 0;
  const amountDue =
    (payment === "full" ? totalPrice : Math.round((totalPrice * PARTIAL_PAYMENT_PERCENT) / 100)) - couponDiscount;
  const remainingAmount = payment === "full" ? 0 : totalPrice - amountDue;

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }
    let list = coupons;
    if (couponsLoading || couponsLoadError || list.length === 0) {
      list = await loadCoupons();
    }
    const coupon = list.find((c) => c.code.toUpperCase() === code);
    if (!coupon) {
      setCouponError(couponsLoadError ? "Couldn't load coupons — check your connection and try again" : "Invalid coupon code");
      setAppliedCoupon(null);
      return;
    }
    if (!coupon.active) {
      setCouponError("This coupon is no longer active");
      setAppliedCoupon(null);
      return;
    }
    if (new Date(coupon.expiresAt).getTime() < Date.now()) {
      setCouponError("This coupon has expired");
      setAppliedCoupon(null);
      return;
    }
    if (coupon.minOrderAmount && totalPrice < coupon.minOrderAmount) {
      setCouponError(
        `Minimum order of ${coupon.currency} ${coupon.minOrderAmount.toLocaleString()} required for this coupon`
      );
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(coupon);
    setCouponError("");
    setShowCouponInput(false);
    setConfettiTrigger((n) => n + 1);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors bg-white";

  const isValid = !!selectedAddress;

  // "Confirm & Pay" opens the (dummy) Stripe checkout gateway; the actual
  // booking is only created once the person submits the card form inside it.
  const openGateway = () => {
    if (!draft || !isValid) return;
    setError("");
    setShowGateway(true);
  };

  const handlePay = async () => {
    if (!draft || !isValid) return;
    setProcessing(true);
    setError("");
    try {
      const guestCount = Math.max(1, Number(draft.numGuests) || 1);

      if (!draft.eventTypeId) {
        throw new Error("Couldn't match your event type to one we recognize — please go back and re-select it.");
      }
      if (!draft.eventStartTime || !draft.eventEndTime) {
        throw new Error("Missing event start/end time — please go back and set them.");
      }
      if (!selectedAddress) {
        throw new Error("Please choose or add a delivery/event address before paying.");
      }

      const priceUnits = await customerApi.masterData.getPriceUnits();
      const priceUnitId = findPriceUnitId(priceUnits, draft.priceUnit);
      if (!priceUnitId) {
        throw new Error(`No matching price unit for "${draft.priceUnit}" — contact support.`);
      }

      const addressParts = selectedAddress
        ? [
            `Address Line 1: ${selectedAddress.addressLine1}`,
            selectedAddress.addressLine2 && `Address Line 2: ${selectedAddress.addressLine2}`,
            selectedAddress.city && `City: ${selectedAddress.city}`,
            selectedAddress.state && `State: ${selectedAddress.state}`,
            selectedAddress.poBoxNumber && `PO Box: ${selectedAddress.poBoxNumber}`,
            selectedAddress.landmark && `Landmark: ${selectedAddress.landmark}`,
          ].filter(Boolean)
        : [];

      const res = await customerApi.bookNow({
        userId: draft.userId,
        packageId: draft.packageId,
        quantity: draft.isRental ? quantity : 1,
        days: draft.isPerDay ? numDays : 1,
        priceUnitId,
        eventDate: draft.eventDate,
        startTime: draft.eventStartTime,
        endTime: draft.eventEndTime,
        eventTypeId: draft.eventTypeId,
        guestCount,
        addressId: selectedAddress.addressId,
        paymentType: payment === "full" ? "FULL" : "PARTIAL",
        couponCode: appliedCoupon?.code,
        // Dummy/demo Stripe integration — see StripeGatewayModal — so there's
        // no real payment intent from Stripe yet to pass through here.
        stripePaymentIntentId: `pi_mock_${Date.now()}`,
        message:
          [...addressParts, draft.phone && `Phone: ${draft.phone}`, message]
            .filter(Boolean)
            .join(" - ") || undefined,
      });
      setBookingId(res.data.bookingId);
      setShowGateway(false);
      setConfettiTrigger((n) => n + 1);
      setConfirmed(true);
      sessionStorage.removeItem("bookingDraft");
      showSuccess("Payment successful — booking confirmed!");
    } catch (cause) {
      const msg = cause instanceof Error ? cause.message : "Payment failed. Please try again.";
      setError(msg);
      showError(msg);
      setShowGateway(false);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Confetti trigger={confettiTrigger} />
      <div className="mb-6 flex items-start gap-3">
        {!confirmed && (
          draft.imageUrl ? (
            <img
              src={draft.imageUrl}
              alt={draft.title}
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
              <ImageOff className="w-5 h-5 text-gray-300" />
            </div>
          )
        )}
        <div className="min-w-0">
          <span className="text-orange-500 text-xs font-semibold uppercase tracking-wider">
            {draft.isPromotional ? "Promotional Booking" : "Booking Payment"}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 truncate">
            {confirmed ? "Payment Complete" : draft.title}
          </h1>
          {!confirmed && draft.vendorName && <p className="text-gray-500 text-sm">by {draft.vendorName}</p>}
        </div>
      </div>

      {confirmed ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Booking Confirmed!</h2>
          <p className="text-gray-500 text-sm">
            Your {draft.isPromotional ? "promotional " : ""}booking was paid and confirmed successfully.
          </p>
          {payment === "full" ? (
            <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Fully Paid
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
              Remaining <CurrencySymbol currency="AED" className="inline-block w-3 h-3" />{remainingAmount.toLocaleString()} due before the event
            </span>
          )}
          <p className="text-gray-700 text-xs font-semibold mt-3 break-all">Booking ID: {bookingId}</p>
          <button
            onClick={() => router.push("/bookings")}
            className="mt-5 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600"
          >
            View My Bookings
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {step === "form" && (
          <>
          {(draft.isRental || draft.isPerDay) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-3">Quantity &amp; Duration</h3>
              <div className={draft.isRental && draft.isPerDay ? "grid grid-cols-2 gap-3" : ""}>
                {draft.isRental && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-semibold text-gray-700 mb-3 block">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-gray-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {draft.isPerDay && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-semibold text-gray-700 mb-3 block">
                      Number of Days <span className="text-gray-400 font-normal">(min 1)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setNumDays((n) => Math.max(1, n - 1))}
                        className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-gray-900">{numDays}</span>
                      <button
                        onClick={() => setNumDays((n) => n + 1)}
                        className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      <span className="text-sm text-gray-400">days</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-orange-50 rounded-xl px-4 py-3 mt-3">
                <p className="text-gray-500 text-xs mb-1">
                  {draft.isRental ? `${quantity} ${quantity === 1 ? "item" : "items"} × ` : ""}
                  {draft.isPerDay ? `${numDays} ${numDays === 1 ? "day" : "days"} × ` : ""}
                  <CurrencySymbol currency="AED" />{draft.basePrice.toLocaleString()}
                </p>
                <p className="text-orange-600 font-semibold text-sm">
                  Estimated Total: <CurrencySymbol currency="AED" />{totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-900">
                Delivery Address <span className="text-orange-400">*</span>
              </h3>
              {selectedAddress && (
                <button
                  type="button"
                  onClick={() => setShowAddressPicker(true)}
                  className="text-xs font-semibold text-orange-500 hover:text-orange-600"
                >
                  Change
                </button>
              )}
            </div>

            {selectedAddress ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 flex items-start gap-2.5 mt-2">
                <MapPin className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 truncate">{selectedAddress.addressLine1}</p>
                    {selectedAddress.isDefault && (
                      <span className="text-[10px] font-semibold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {[
                      selectedAddress.addressLine2,
                      [selectedAddress.city, selectedAddress.state].filter(Boolean).join(", "),
                      selectedAddress.landmark,
                      selectedAddress.poBoxNumber && `PO Box ${selectedAddress.poBoxNumber}`,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddressPicker(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-3.5 py-3 text-sm text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors mt-2"
              >
                <MapPin className="w-4 h-4" /> Select a delivery address
              </button>
            )}
          </div>

          {showAddressPicker && (
            <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddressPicker(false)} />
              <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm z-10 max-h-[80vh] overflow-y-auto">
                <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white">
                  <h3 className="font-bold text-gray-900 text-sm">Choose delivery address</h3>
                  <button onClick={() => setShowAddressPicker(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 space-y-2.5">
                  {addresses.map((addr) => (
                    <button
                      key={addr.addressId}
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(addr.addressId);
                        setShowAddressPicker(false);
                      }}
                      className={`w-full text-left rounded-xl border px-3.5 py-3 flex items-start gap-2.5 transition-colors ${
                        addr.addressId === selectedAddressId ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span
                        className={`mt-1 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                          addr.addressId === selectedAddressId ? "border-orange-500" : "border-gray-300"
                        }`}
                      >
                        {addr.addressId === selectedAddressId && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-800 truncate">{addr.addressLine1}</p>
                          {addr.isDefault && (
                            <span className="text-[10px] font-semibold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {[
                            addr.addressLine2,
                            [addr.city, addr.state].filter(Boolean).join(", "),
                            addr.landmark,
                            addr.poBoxNumber && `PO Box ${addr.poBoxNumber}`,
                          ]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </p>
                      </div>
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditAddress(addr);
                        }}
                        className="text-xs text-gray-400 hover:text-orange-500 flex-shrink-0"
                      >
                        Edit
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={openAddAddress}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-3.5 py-2.5 text-sm font-semibold text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add new address
                  </button>
                </div>
              </div>
            </div>
          )}

          {showAddressForm && (
            <AddressModal
              isEditing={!!editingAddressId}
              form={addressForm}
              saving={savingAddress}
              onChange={handleAddressFormChange}
              onSubmit={handleSaveAddress}
              onClose={() => setShowAddressForm(false)}
            />
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-3">Payment Type</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPayment("full")}
                className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                  payment === "full" ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <p className="text-xs font-semibold text-gray-900">Full Payment (100%)</p>
                <p className="text-[11px] text-gray-400">Pay complete amount now</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPayment("partial");
                  setAppliedCoupon(null);
                  setShowCouponInput(false);
                  setCouponError("");
                }}
                className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                  payment === "partial" ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <p className="text-xs font-semibold text-gray-900">Partial Payment ({PARTIAL_PAYMENT_PERCENT}%)</p>
                <p className="text-[11px] text-gray-400">Rest before the event</p>
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount due now</span>
                <span className={`font-semibold text-gray-900 ${couponDiscount > 0 ? "line-through text-gray-400" : ""}`}>
                  <CurrencySymbol currency="AED" />{(amountDue + couponDiscount).toLocaleString()}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Coupon ({appliedCoupon?.code})</span>
                  <span className="font-semibold text-green-600">-<CurrencySymbol currency="AED" />{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                  <span className="text-gray-700 font-semibold">Payable now</span>
                  <span className="font-bold text-orange-500"><CurrencySymbol currency="AED" />{amountDue.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-2">
                <span className="text-gray-500">Remaining</span>
                {payment === "full" ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-green-600">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Fully Paid
                  </span>
                ) : (
                  <span className="font-semibold text-amber-600">
                    <CurrencySymbol currency="AED" />{remainingAmount.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {payment === "full" && (
              <div className="mt-3">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2">
                    <p className="text-xs font-semibold text-green-700">
                      🎉 Coupon <span className="font-mono">{appliedCoupon.code}</span> applied
                      {appliedCoupon.type === "PERCENTAGE" ? ` (${appliedCoupon.value}% off)` : ` (${appliedCoupon.currency} ${appliedCoupon.value} off)`}
                    </p>
                    <button type="button" onClick={handleRemoveCoupon} className="text-xs font-semibold text-green-700 hover:text-green-900">
                      Remove
                    </button>
                  </div>
                ) : showCouponInput ? (
                  <div>
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          if (couponError) setCouponError("");
                        }}
                        placeholder="Enter coupon code"
                        className={`${inputClass} flex-1 uppercase`}
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponsLoading}
                        className="px-4 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {couponsLoading ? "Checking..." : "Apply"}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                    {couponsLoadError && !couponError && (
                      <p className="text-xs text-amber-600 mt-1">Couldn't reach coupon service — will retry when you tap Apply.</p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCouponInput(true)}
                    className="text-xs font-semibold text-orange-500 hover:text-orange-600"
                  >
                    Have a coupon code? Apply it
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
  <h3 className="font-bold text-gray-900 mb-3">Message / Special Requests</h3>
  <textarea
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    rows={3}
    maxLength={500}
    placeholder="Any special requests or notes for the vendor..."
    className={`${inputClass} resize-none`}
  />
  <div className="text-right text-xs text-gray-500 mt-1">
    {message.length}/500
  </div>
</div>
          <button
            onClick={() => {
              if (!isValid) return;
              setError("");
              setStep("summary");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={!isValid}
            className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
          >
            Continue
          </button>
          </>
          )}

          {step === "summary" && (
          <>
          <button
            type="button"
            onClick={() => setStep("form")}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to details
          </button>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2.5">
            <h3 className="font-bold text-gray-900 text-base mb-2">Booking Summary</h3>
            {draft.imageUrl && (
              <img
                src={draft.imageUrl}
                alt={draft.title}
                className="w-full h-32 rounded-xl object-cover border border-gray-100 mb-1"
              />
            )}
            <Row label={draft.isPromotional ? "Promotion" : "Service"} value={draft.title} />
            {draft.vendorName && <Row label="Vendor" value={draft.vendorName} />}
            <Row label="Event Date" value={draft.eventDateDisplay || "—"} />
            <Row
              label="Event Time"
              value={draft.eventStartTime && draft.eventEndTime ? `${draft.eventStartTime} - ${draft.eventEndTime}` : "—"}
            />
            <Row label="Event Type" value={draft.eventType || "—"} />
            <Row
              label="Event Address"
              value={
                selectedAddress
                  ? [
                      selectedAddress.addressLine1,
                      selectedAddress.addressLine2,
                      selectedAddress.city,
                      selectedAddress.state,
                      selectedAddress.poBoxNumber && `PO Box ${selectedAddress.poBoxNumber}`,
                      selectedAddress.landmark,
                    ]
                      .filter(Boolean)
                      .join(", ")
                  : "—"
              }
            />
            <Row label="Guests" value={draft.numGuests || "—"} />
            {draft.isRental && <Row label="Quantity" value={`${quantity}`} />}
            {draft.isPerDay && <Row label="Duration" value={`${numDays} day${numDays > 1 ? "s" : ""}`} />}
            <Row label="Payment Type" value={payment === "full" ? "Full (100%)" : `Partial (${PARTIAL_PAYMENT_PERCENT}%)`} />
            {couponDiscount > 0 && (
              <Row label="Coupon" value={<>{appliedCoupon?.code} (-<CurrencySymbol currency="AED" />{couponDiscount.toLocaleString()})</>} />
            )}
            <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold">
              <span className="text-gray-900">Amount Due Now</span>
              <span className="text-orange-500 text-base"><CurrencySymbol currency="AED" />{amountDue.toLocaleString()}</span>
            </div>
            <Row
              label="Remaining"
              value={
                payment === "full" ? (
                  <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Fully Paid
                  </span>
                ) : (
                  <><CurrencySymbol currency="AED" />{remainingAmount.toLocaleString()}</>
                )
              }
            />

            <div className="border-t border-gray-100 pt-3 mt-1">
              <h4 className="font-bold text-gray-900 text-sm mb-2">Your Details</h4>
              <Row label="Name" value={draft.fullName || "—"} />
              <Row label="Email" value={draft.email || "—"} />
              <Row label="Phone" value={draft.phone || "—"} />
              {message && <Row label="Note" value={message} />}
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={openGateway}
            disabled={processing || !isValid}
            className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
          >
            {processing ? "Processing…" : <>Confirm &amp; Pay (<CurrencySymbol currency="AED" />{amountDue.toLocaleString()})</>}
          </button>
          </>
          )}
        </div>
      )}

      {showGateway && (
        <StripeGatewayModal
          amount={amountDue}
          currency="AED"
          processing={processing}
          onPay={handlePay}
          onClose={() => !processing && setShowGateway(false)}
        />
      )}
    </div>
  );
}