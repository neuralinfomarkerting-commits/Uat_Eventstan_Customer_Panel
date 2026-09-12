"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ChevronDown, Search, X, Check, MapPin, Plus } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import CurrencySymbol from "@/components/ui/CurrencySymbol";
import { useAuth } from "@/lib/AuthContext";
import { customerApi, getEventMasters, Coupon } from "@/api/customerApi";
import type { Country } from "@/api/customerApi";
import { CartItem } from "@/types";
import { showError, showSuccess } from "@/lib/toast";
import Confetti from "@/components/ui/Confetti";
import { Address, AddressFormData, emptyAddressForm } from "@/components/profile/types";
import { loadMockAddresses, saveMockAddresses, getDefaultAddress } from "@/lib/mockAddresses";
import AddressModal from "@/components/profile/AddressModal";
import StripeGatewayModal from "@/components/ui/StripeGatewayModal";

const toIsoDate = (ddmmyyyy: string) => {
  const match = ddmmyyyy.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return "";
  const [, dd, mm, yyyy] = match;
  const iso = `${yyyy}-${mm}-${dd}`;
  const d = new Date(iso);
  if (
    d.getFullYear() !== Number(yyyy) ||
    d.getMonth() + 1 !== Number(mm) ||
    d.getDate() !== Number(dd)
  ) {
    return "";
  }
  return iso;
};

const fromIsoDate = (iso: string) => {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, yyyy, mm, dd] = match;
  return `${dd}-${mm}-${yyyy}`;
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const weekDayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const pad2 = (n: number) => String(n).padStart(2, "0");

interface CustomDatePickerProps {
  value: string;
  onChange: (ddmmyyyy: string) => void;
  minIsoDate: string;
  error?: boolean;
}

const CustomDatePicker = ({ value, onChange, minIsoDate, error = false }: CustomDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedIso = toIsoDate(value);
  const initial = selectedIso ? new Date(selectedIso) : new Date(minIsoDate);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const minDate = new Date(minIsoDate);
  minDate.setHours(0, 0, 0, 0);

  const openPicker = () => {
    const iso = toIsoDate(value);
    const base = iso ? new Date(iso) : new Date(minIsoDate);
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setIsOpen(true);
  };

  const goPrevMonth = () => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const goNextMonth = () => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handlePick = (day: number) => {
    const picked = new Date(viewYear, viewMonth, day);
    picked.setHours(0, 0, 0, 0);
    if (picked < minDate) return;
    const iso = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`;
    onChange(fromIsoDate(iso));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openPicker())}
        className={`w-full flex items-center px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors bg-white pl-9 text-left relative ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        }`}
      >
        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || "dd-mm-yyyy"}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={goPrevMonth}
                className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600"
              >
                ‹
              </button>
              <span className="text-sm font-semibold text-gray-800">
                {monthNames[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={goNextMonth}
                className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600"
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {weekDayLabels.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (day === null) return <div key={idx} />;
                const cellDate = new Date(viewYear, viewMonth, day);
                cellDate.setHours(0, 0, 0, 0);
                const isBlocked = cellDate < minDate;
                const isSelected =
                  selectedIso === `${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`;
                const isMinDate = cellDate.getTime() === minDate.getTime();

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isBlocked}
                    onClick={() => handlePick(day)}
                    className={`h-8 w-8 text-xs rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-orange-500 text-white font-semibold"
                        : isBlocked
                        ? "text-gray-300 cursor-not-allowed"
                        : isMinDate
                        ? "border border-orange-300 text-orange-600 hover:bg-orange-50"
                        : "text-gray-700 hover:bg-orange-50"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  loading?: boolean;
  error?: boolean;
  disabled?: boolean;
}

const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder,
  loading = false,
  error = false,
  disabled = false,
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearch("");
  };

  const inputClass = () =>
    `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors bg-white ${
      error
        ? "border-red-400 focus:border-red-500"
        : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
    }`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={`${inputClass()} flex items-center justify-between text-left w-full ${
          disabled || loading ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {loading ? "Loading..." : value || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && !loading && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 w-full mt-2 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                autoFocus
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">No results found</div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className="w-full px-4 py-2.5 text-sm text-left hover:bg-orange-50 transition-colors flex items-center justify-between"
                  >
                    <span>{option}</span>
                    {value === option && <Check className="h-4 w-4 text-orange-500 flex-shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface EventDetails {
  name: string;
  email: string;
  phone: string;
  event_date: string;
  event_start_time: string;
  event_end_time: string;
  event_type: string;
  guest_count: string;
  message: string;
}

type PaymentType = "partial" | "full";

const FALLBACK_EVENT_TYPES = [
  "Wedding",
  "Corporate",
  "Birthday",
  "Anniversary",
  "Baby Shower",
  "Graduation",
  "Engagement",
  "Conference",
  "Seminar",
  "Team Building",
  "Holiday Party",
  "Product Launch",
  "Other",
];

const PARTIAL_PAYMENT_PERCENT = 50;

// Splits a stored "+<code><number>" phone string back into a country
// code + local number. Country codes aren't a fixed length (+971 is 3
// digits, +1 is 1, etc.), so this matches against the real list of known
// codes (longest first) instead of blindly grabbing a fixed digit count.
function splitPhone(raw: string, countries: Country[]): { code: string; number: string } {
  const cleaned = (raw ?? "").trim();
  if (!cleaned.startsWith("+")) {
    return { code: "+971", number: cleaned.replace(/\D/g, "") };
  }
  const digits = cleaned.slice(1).replace(/\D/g, "");
  const knownCodes = countries
    .map((c) => (c.phoneCode ?? "").replace("+", ""))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  for (const code of knownCodes) {
    if (digits.startsWith(code)) {
      return { code: `+${code}`, number: digits.slice(code.length) };
    }
  }
  // Countries list not loaded yet (or code not in it) — fall back to a
  // 3-digit guess, which covers the common UAE/GCC case, rather than a
  // greedy 4-digit grab that shifts a real digit out of the number.
  return { code: `+${digits.slice(0, 3)}`, number: digits.slice(3) };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, total, count, clearCart, loading: cartLoading } = useCart();

  const initialPhone = splitPhone(user?.phone ?? "", []);

  const [details, setDetails] = useState<EventDetails>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: initialPhone.number,
    event_date: "",
    event_start_time: "",
    event_end_time: "",
    event_type: "",
    guest_count: "",
    message: "",
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const [countryCode, setCountryCode] = useState(initialPhone.code);
  const [codeOpen, setCodeOpen] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [payment, setPayment] = useState<PaymentType>("full");
  const [submitting, setSubmitting] = useState(false);
  const [showGateway, setShowGateway] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [checkoutId, setCheckoutId] = useState("");
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [confirmedSavings, setConfirmedSavings] = useState(0);
  const [confirmedCouponCode, setConfirmedCouponCode] = useState("");

  const [eventTypeOptions, setEventTypeOptions] = useState<string[]>(FALLBACK_EVENT_TYPES);
  const [eventTypesLoading, setEventTypesLoading] = useState(true);
  // The backend's checkout endpoint wants the eventTypeId, not the free-text
  // label shown in the dropdown, so the id has to be looked up by name.
  const [eventTypeIdByName, setEventTypeIdByName] = useState<Record<string, string>>({});

  const [couponInput, setCouponInput] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponsLoadError, setCouponsLoadError] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

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

  useEffect(() => {
    if (!user) return;
    setDetails((d) => {
      if (d.phone) return { ...d, name: d.name || user.name || "", email: d.email || user.email || "" };
      const { number } = splitPhone(user.phone ?? "", countries);
      return { ...d, name: d.name || user.name || "", email: d.email || user.email || "", phone: number };
    });
    if (!details.phone && user.phone) {
      setCountryCode(splitPhone(user.phone, countries).code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    getEventMasters()
      .then((events) => {
        if (!cancelled && events.length > 0) {
          setEventTypeOptions(events.map((e) => e.eventName));
          setEventTypeIdByName(Object.fromEntries(events.map((e) => [e.eventName, e.id])));
        }
      })
      .catch((err) => {
        console.error("Error fetching event types:", err);
      })
      .finally(() => {
        if (!cancelled) setEventTypesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    customerApi.masterData.getCountries().then((list) => {
      if (!cancelled && list.length > 0) {
        setCountries(list);
        // Re-derive the code/number split now that we have the real list,
        // in case the earlier fallback guess was wrong.
        if (user?.phone) {
          const { code, number } = splitPhone(user.phone, list);
          setCountryCode(code);
          setDetails((d) => (d.phone ? d : { ...d, phone: number }));
        } else {
          setCountryCode((c) => c || list[0].phoneCode);
        }
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const minEventDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const eventDateDisplay = details.event_date ? fromIsoDate(details.event_date) : "";

  const handleEventDateChange = (ddmmyyyy: string) => {
    const iso = toIsoDate(ddmmyyyy);
    setDetails((d) => ({ ...d, event_date: iso }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setDetails((d) => ({ ...d, [e.target.name]: e.target.value }));
  };

  const isValid =
    details.name.trim() &&
    details.email.trim() &&
    details.phone.trim() &&
    details.event_date.trim() &&
    details.event_date >= minEventDate &&
    details.event_start_time.trim() &&
    details.event_end_time.trim() &&
    details.event_type.trim() &&
    !!selectedAddress;

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

  const computeCouponDiscount = (coupon: Coupon, amount: number) => {
    if (coupon.type === "PERCENTAGE") {
      const raw = Math.round((amount * coupon.value) / 100);
      return coupon.maxDiscountAmount ? Math.min(raw, coupon.maxDiscountAmount) : raw;
    }
    return Math.min(coupon.value, amount);
  };

  const couponDiscount =
    payment === "full" && appliedCoupon ? computeCouponDiscount(appliedCoupon, total) : 0;

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
    if (coupon.minOrderAmount && total < coupon.minOrderAmount) {
      setCouponError(
        `Minimum order of ${coupon.currency} ${coupon.minOrderAmount.toLocaleString()} required for this coupon`
      );
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(coupon);
    setCouponError("");
    setShowCouponInput(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const amountDue =
    (payment === "full" ? total : Math.round((total * PARTIAL_PAYMENT_PERCENT) / 100)) - couponDiscount;

  const openGateway = () => {
    if (!user) {
      router.push("/auth/login?redirect=/checkout");
      return;
    }
    if (!isValid) return;

    const cartItemIds = items
      .map((i) => i.cartItemId)
      .filter((id): id is string => Boolean(id));

    if (cartItemIds.length === 0) {
      setError("These items need to be re-added to your cart while logged in before checkout.");
      return;
    }

    setError("");
    setShowGateway(true);
  };

  const handlePay = async () => {
    if (!user) {
      router.push("/auth/login?redirect=/checkout");
      return;
    }
    if (!isValid) return;

    const cartItemIds = items
      .map((i) => i.cartItemId)
      .filter((id): id is string => Boolean(id));

    if (cartItemIds.length === 0) {
      setError("These items need to be re-added to your cart while logged in before checkout.");
      return;
    }

    const addressParts = selectedAddress
      ? [
          `Address Line 1: ${selectedAddress.addressLine1}`,
          selectedAddress.addressLine2 && `Address Line 2: ${selectedAddress.addressLine2}`,
          selectedAddress.city && `City: ${selectedAddress.city}`,
          selectedAddress.state && `State: ${selectedAddress.state}`,
          selectedAddress.poBoxNumber && `PO Box: ${selectedAddress.poBoxNumber}`,
          selectedAddress.landmark && `Landmark: ${selectedAddress.landmark}`,
        ]
      : [];

    const eventTypeId = eventTypeIdByName[details.event_type.trim()];
    if (!eventTypeId) {
      setError("Couldn't match your event type to one we recognize — please re-select it.");
      return;
    }
    if (!selectedAddress) {
      setError("Please choose or add an event address before paying.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await customerApi.checkout({
        userId: user.id,
        cartItemIds,
        eventDate: details.event_date,
        startTime: details.event_start_time,
        endTime: details.event_end_time,
        eventTypeId,
        guestCount: Math.max(1, Number(details.guest_count) || 1),
        addressId: selectedAddress.addressId,
        couponCode: appliedCoupon?.code,
        paymentType: payment === "full" ? "FULL" : "PARTIAL",
        // Dummy/demo Stripe integration — see StripeGatewayModal — so
        // there's no real payment intent from Stripe yet to pass through.
        stripePaymentIntentId: `pi_mock_${Date.now()}`,
        message:
          [...addressParts, details.message]
            .filter(Boolean)
            .join(" - ") || undefined,
      });
      setCheckoutId(res.data.checkoutId);
      setConfirmedSavings(couponDiscount);
      setConfirmedCouponCode(appliedCoupon?.code ?? "");
      clearCart();
      setShowGateway(false);
      setConfirmed(true);
      setConfettiTrigger((n) => n + 1);
      showSuccess("Booking request submitted successfully!");
    } catch (cause) {
      const msg = cause instanceof Error ? cause.message : "Unable to complete checkout.";
      setError(msg);
      showError(msg);
      setShowGateway(false);
    } finally {
      setSubmitting(false);
    }
  };

  const goToUrgentBooking = () => {
    const params = new URLSearchParams();
    if (details.name.trim()) params.set("name", details.name.trim());
    if (details.email.trim()) params.set("email", details.email.trim());
    if (details.phone.trim()) params.set("phone", `${countryCode}${details.phone.trim()}`);
    if (details.event_type.trim()) params.set("event_type", details.event_type.trim());
    if (details.event_date.trim()) params.set("event_date", details.event_date.trim());
    if (details.event_start_time.trim()) params.set("start_time", details.event_start_time.trim());
    if (details.event_end_time.trim()) params.set("end_time", details.event_end_time.trim());
    const qs = params.toString();
    router.push(qs ? `/urgent-booking?${qs}` : "/urgent-booking");
  };

  if (confirmed) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <Confetti trigger={confettiTrigger} />
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Booking Requested!
        </h1>
        <p className="text-gray-500 max-w-sm mb-6">
          Your booking has been submitted. Vendors will confirm your request and you&apos;ll arrange payment directly.
        </p>
        {checkoutId && (
          <p className="text-gray-700 text-xs font-semibold mb-3 break-all">Booking ID: {checkoutId}</p>
        )}
        {payment === "full" ? (
          <span className="inline-flex items-center gap-1 mb-3 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Fully Paid
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 mb-3 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
            Remaining <CurrencySymbol currency="AED" className="inline-block w-3 h-3" />{(total - amountDue).toLocaleString()} due before the event
          </span>
        )}
        {confirmedSavings > 0 && (
          <div className="mb-6 mx-auto max-w-xs rounded-xl border border-dashed border-green-300 bg-green-50 px-4 py-3">
            <p className="text-xs text-green-700 font-medium">
              🎉 Coupon {confirmedCouponCode} applied — you saved <CurrencySymbol currency="AED" />{confirmedSavings.toLocaleString()}
            </p>
          </div>
        )}
        <button
          onClick={() => router.push("/bookings")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          View My Bookings
        </button>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        Loading your cart…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium mb-1">Your cart is empty</p>
        <p className="text-gray-400 text-sm mb-5">Add a service or package to check out.</p>
        <button
          onClick={() => router.push("/")}
          className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
        >
          Browse Services
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Services
      </button>

      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2 space-y-6">
          {}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-5">Event Details</h2>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name *</label>
                <input
                  name="name" value={details.name} readOnly
                  placeholder="Your full name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email *</label>
                <input
                  name="email" value={details.email} readOnly
                  type="email" placeholder="you@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone *</label>
                <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-1 pl-3.5 pr-2 py-2.5 text-sm text-gray-500 font-medium border-r border-gray-200 flex-shrink-0">
                    <span>
                      {countries.find((c) => c.phoneCode === countryCode)?.flag ?? "🌐"}
                    </span>
                    <span>{countryCode}</span>
                  </div>

                  <input
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="50 000 0000"
                    value={details.phone}
                    readOnly
                    className="w-full bg-transparent pl-3 pr-4 py-2.5 text-sm text-gray-500 placeholder-gray-400 rounded-xl cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 mb-1.5">
                  <label className="text-sm font-medium text-gray-700 block">Event Date *</label>
                  <button
                    type="button"
                    onClick={goToUrgentBooking}
                    className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors flex-shrink-0 animate-blink"
                  >
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Need it urgently? Request Urgent Booking</span>
                  </button>
                </div>
                <CustomDatePicker
                  value={eventDateDisplay}
                  onChange={handleEventDateChange}
                  minIsoDate={minEventDate}
                  error={!!details.event_date && details.event_date < minEventDate}
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Bookings need at least 2 days&apos; notice — earliest available date is{" "}
                  {new Date(minEventDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-")}.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Event Start Time *</label>
                <input
                  name="event_start_time" value={details.event_start_time} onChange={handleChange}
                  type="time"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Event End Time *</label>
                <input
                  name="event_end_time" value={details.event_end_time} onChange={handleChange}
                  type="time"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Event Type</label>
                <SearchableSelect
                  value={details.event_type}
                  onChange={(value) => setDetails((d) => ({ ...d, event_type: value }))}
                  options={eventTypeOptions}
                  placeholder="Select event type"
                  loading={eventTypesLoading}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Number of Guests</label>
                <input
                  name="guest_count" value={details.guest_count} onChange={handleChange}
                  type="number" placeholder="50"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700 block">
                    Delivery Address <span className="text-orange-400">*</span>
                  </label>
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
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {selectedAddress.addressLine1}
                        </p>
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
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-3.5 py-3 text-sm text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors"
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
                            addr.addressId === selectedAddressId
                              ? "border-orange-400 bg-orange-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span
                            className={`mt-1 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                              addr.addressId === selectedAddressId ? "border-orange-500" : "border-gray-300"
                            }`}
                          >
                            {addr.addressId === selectedAddressId && (
                              <span className="w-2 h-2 rounded-full bg-orange-500" />
                            )}
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

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Message</label>
                <textarea
                  name="message" value={details.message} onChange={handleChange}
                  rows={3} placeholder="Any special requirements..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-5">Payment Type</h2>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <PaymentTypeOption
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
                title="Full Payment (100%)"
                subtitle="Pay the complete amount now"
                selected={payment === "full"}
                onSelect={() => setPayment("full")}
              />
              <PaymentTypeOption
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0 011-1z" />
                  </svg>
                }
                title={`Partial Payment (${PARTIAL_PAYMENT_PERCENT}%)`}
                subtitle={`Pay ${PARTIAL_PAYMENT_PERCENT}% now, rest before the event`}
                selected={payment === "partial"}
                onSelect={() => setPayment("partial")}
              />
            </div>

            {payment === "full" && (
              <div className="mt-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2">
                    <p className="text-xs font-semibold text-green-700">
                      🎉 Coupon <span className="font-mono">{appliedCoupon.code}</span> applied
                      {appliedCoupon.type === "PERCENTAGE" ? ` (${appliedCoupon.value}% off)` : ` (${appliedCoupon.currency} ${appliedCoupon.value} off)`}
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-semibold text-green-700 hover:text-green-900 flex-shrink-0 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : showCouponInput ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          if (couponError) setCouponError("");
                        }}
                        placeholder="Enter coupon code"
                        className="flex-1 uppercase w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors bg-white border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponsLoading}
                        className="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 flex-shrink-0"
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
                    className="text-sm font-semibold text-orange-500 hover:text-orange-600"
                  >
                    Have a coupon code? Apply it
                  </button>
                )}
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4 mt-4 space-y-2">
              {payment === "full" && couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900"><CurrencySymbol currency="AED" />{total.toLocaleString()}</span>
                </div>
              )}
              {payment === "full" && couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Coupon ({appliedCoupon?.code})</span>
                  <span className="font-semibold text-green-600">-<CurrencySymbol currency="AED" />{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount due now</span>
                <span className="font-semibold text-gray-900"><CurrencySymbol currency="AED" />{amountDue.toLocaleString()}</span>
              </div>
              {payment === "partial" && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Remaining (due before event)</span>
                  <span className="font-semibold text-gray-900">
                    <CurrencySymbol currency="AED" />{(total - amountDue).toLocaleString()}
                  </span>
                </div>
              )}
              {payment === "full" && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Remaining</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-green-600">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Fully Paid
                  </span>
                </div>
              )}
              {payment === "partial" && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2">
                  Note: the remaining {100 - PARTIAL_PAYMENT_PERCENT}% must be fully paid before your event date — it is not collected afterward.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={openGateway}
            disabled={submitting || !isValid}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-base hover:bg-orange-600 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Processing..." : <>Pay <CurrencySymbol currency="AED" />{Math.max(amountDue, 0).toLocaleString()} & Book</>}
          </button>

          {showGateway && (
            <StripeGatewayModal
              amount={Math.max(amountDue, 0)}
              currency="AED"
              processing={submitting}
              onPay={handlePay}
              onClose={() => !submitting && setShowGateway(false)}
            />
          )}
        </div>

        {}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <SummaryRow key={item.id} item={item} />
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span><CurrencySymbol currency="AED" />{total.toLocaleString()}</span>
              </div>
              {payment === "full" && couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>-<CurrencySymbol currency="AED" />{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-1">
                <span className="text-gray-900">Total</span>
                <span className="text-orange-500"><CurrencySymbol currency="AED" />{Math.max(total - couponDiscount, 0).toLocaleString()}</span>
              </div>
              {payment === "partial" && (
                <div className="flex justify-between text-sm pt-1 text-orange-600 font-semibold">
                  <span>Due now ({PARTIAL_PAYMENT_PERCENT}%)</span>
                  <span><CurrencySymbol currency="AED" />{amountDue.toLocaleString()}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-4">
              {count} item{count > 1 ? "s" : ""} · final price confirmed by vendor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentTypeOption({
  icon, title, subtitle, selected, onSelect,
}: {
  icon: React.ReactNode; title: string; subtitle: string; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex flex-col items-start gap-2 rounded-xl border px-3 py-3 sm:px-4 sm:py-3.5 text-left transition-all ${
        selected ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          selected ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"
        }`}>
          {icon}
        </div>
        <span className={`w-4.5 h-4.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
          selected ? "border-orange-500" : "border-gray-300"
        }`}>
          {selected && <span className="w-2 h-2 rounded-full bg-orange-500" />}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </button>
  );
}

function SummaryRow({ item }: { item: CartItem }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
        {typeof item.image_url === "string" && item.image_url.trim() ? (
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200" aria-hidden />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
        <p className="text-xs text-gray-400 truncate">{item.subtitle}</p>
      </div>
      <span className="text-sm font-bold text-gray-900 flex-shrink-0"><CurrencySymbol currency="AED" />{item.price.toLocaleString()}</span>
    </div>
  );
}