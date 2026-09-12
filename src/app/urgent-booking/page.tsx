"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, ChevronDown, Search, X, Check, MapPin, Plus } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import CurrencySymbol from "@/components/ui/CurrencySymbol";
import { customerApi, getEventMasters } from "@/api/customerApi";
import type { Country } from "@/api/customerApi";
import { showError, showSuccess } from "@/lib/toast";
import { Address, AddressFormData, emptyAddressForm } from "@/components/profile/types";
import { loadMockAddresses, saveMockAddresses, getDefaultAddress } from "@/lib/mockAddresses";
import AddressModal from "@/components/profile/AddressModal";

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
  minIsoDate?: string;
  error?: boolean;
}

const CustomDatePicker = ({ value, onChange, minIsoDate, error = false }: CustomDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const minDate = minIsoDate ? new Date(minIsoDate) : new Date();
  minDate.setHours(0, 0, 0, 0);
  const minDateIso = `${minDate.getFullYear()}-${pad2(minDate.getMonth() + 1)}-${pad2(minDate.getDate())}`;

  const selectedIso = toIsoDate(value);
  const initial = selectedIso ? new Date(selectedIso) : new Date(minDateIso);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const openPicker = () => {
    const iso = toIsoDate(value);
    const base = iso ? new Date(iso) : new Date(minDateIso);
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

interface UrgentForm {
  name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string;
  event_start_time: string;
  event_end_time: string;
  guest_count: string;
  message: string;
}

export default function UrgentBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
          Loading…
        </div>
      }
    >
      <UrgentBookingContent />
    </Suspense>
  );
}

function UrgentBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { items, total, count, loading: cartLoading } = useCart();

  const initialPhoneRaw = searchParams.get("phone") ?? user?.phone ?? "";
  const initialPhone = splitPhone(initialPhoneRaw, []);

  const [form, setForm] = useState<UrgentForm>({
    name: searchParams.get("name") ?? user?.name ?? "",
    email: searchParams.get("email") ?? user?.email ?? "",
    phone: initialPhone.number,
    event_type: searchParams.get("event_type") ?? "",
    event_date: searchParams.get("event_date") ?? "",
    event_start_time: searchParams.get("start_time") ?? "",
    event_end_time: searchParams.get("end_time") ?? "",
    guest_count: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const [eventTypeOptions, setEventTypeOptions] = useState<string[]>(FALLBACK_EVENT_TYPES);
  const [eventTypesLoading, setEventTypesLoading] = useState(true);

  const [countries, setCountries] = useState<Country[]>([]);
  const [countryCode, setCountryCode] = useState(initialPhone.code);
  const [codeOpen, setCodeOpen] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  // --- Address state (same pattern as checkout) ---
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
  // --- end address state ---

  useEffect(() => {
    if (!user) return;
    setForm((f) => {
      if (f.phone) return { ...f, name: f.name || user.name || "", email: f.email || user.email || "" };
      const { number } = splitPhone(user.phone ?? "", countries);
      return { ...f, name: f.name || user.name || "", email: f.email || user.email || "", phone: number };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    customerApi.masterData.getCountries().then((list) => {
      if (!cancelled && list.length > 0) {
        setCountries(list);
        // Re-derive the code/number split now that we have the real list,
        // in case the earlier fallback guess was wrong.
        const { code, number } = splitPhone(initialPhoneRaw, list);
        setCountryCode(code);
        setForm((f) => (f.phone ? f : { ...f, phone: number }));
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    getEventMasters()
      .then((events) => {
        if (!cancelled && events.length > 0) {
          setEventTypeOptions(events.map((e) => e.eventName));
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const eventDateDisplay = form.event_date ? fromIsoDate(form.event_date) : "";
  const handleEventDateChange = (ddmmyyyy: string) => {
    setForm((f) => ({ ...f, event_date: toIsoDate(ddmmyyyy) }));
  };

  const isValid = form.name.trim() && form.email.trim() && form.phone.trim();

  const handleSubmit = async () => {
    if (!isValid) {
      setError("Please fill in your name, email and phone so our team can reach you.");
      return;
    }

    const cartSummary =
      items.length > 0
        ? `Cart (${count} item${count > 1 ? "s" : ""}, AED ${total.toLocaleString()}): ${items
            .map((i) => i.title)
            .join(", ")}`
        : "Cart is empty.";

    const timeInfo =
      form.event_start_time || form.event_end_time
        ? `Event Time: ${form.event_start_time || "?"} - ${form.event_end_time || "?"}`
        : "";

    const addressInfo = selectedAddress
      ? `Address: ${[
          selectedAddress.addressLine1,
          selectedAddress.addressLine2,
          [selectedAddress.city, selectedAddress.state].filter(Boolean).join(", "),
          selectedAddress.landmark,
          selectedAddress.poBoxNumber && `PO Box ${selectedAddress.poBoxNumber}`,
        ]
          .filter(Boolean)
          .join(", ")}`
      : "";

    setSubmitting(true);
    setError("");
    try {
      await customerApi.leads.submitUserLead({
        fullName: form.name.trim(),
        email: form.email.trim(),
        phone: `${countryCode}${form.phone.trim()}`,
        eventType: form.event_type.trim() || "Urgent Booking",
        preferredEventDate: form.event_date || undefined,
        expectedGuestCount: form.guest_count ? Number(form.guest_count) : undefined,
        additionalDetails: [
          "URGENT BOOKING REQUEST — needs a callback as soon as possible.",
          timeInfo,
          addressInfo,
          cartSummary,
          form.message.trim() && `Notes: ${form.message.trim()}`,
        ]
          .filter(Boolean)
          .join(" | "),
      });
      setSent(true);
      showSuccess("Your urgent booking request has been sent!");
    } catch (cause) {
      const msg = cause instanceof Error ? cause.message : "Unable to send your request. Please try calling us instead.";
      setError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Urgent Request Sent!
        </h1>
        <p className="text-gray-500 max-w-sm mb-6">
          Our team has been notified and will call you shortly to help with your last-minute booking.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push("/")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Browse Services
          </button>
          <button
            onClick={() => router.push("/bookings")}
            className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900">Urgent Booking</h1>
      </div>
      <p className="text-gray-500 mb-6">
        Need something planned in the next couple of days? Share your details and our team
        will call you back as soon as possible to work out a last-minute booking.
      </p>

      {}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-serif text-lg font-bold text-gray-900">Your Cart</h2>
          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
          >
            {items.length > 0 ? "Edit in Checkout →" : "Go to Checkout →"}
          </button>
        </div>
        {cartLoading ? (
          <p className="text-sm text-gray-400">Loading your cart…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400">Your cart is empty — that&apos;s okay, our team can still help you find vendors.</p>
        ) : (
          <div className="space-y-2 mt-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-gray-700 truncate min-w-0">{item.title}</span>
                <span className="text-gray-900 font-semibold flex-shrink-0"><CurrencySymbol currency="AED" />{item.price.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm font-bold pt-2 border-t border-gray-100">
              <span className="text-gray-900">Total ({count} item{count > 1 ? "s" : ""})</span>
              <span className="text-orange-500"><CurrencySymbol currency="AED" />{total.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name *</label>
            <input
              name="name" value={form.name} onChange={handleChange}
              placeholder="Your full name"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email *</label>
            <input
              name="email" value={form.email} onChange={handleChange}
              type="email" placeholder="you@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone *</label>
            <div
              className={`relative flex items-center bg-white border rounded-xl transition-all ${
                phoneFocused
                  ? "border-orange-400 ring-2 ring-orange-100"
                  : "border-gray-200"
              }`}
            >
              <div className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setCodeOpen((o) => !o);
                  }}
                  className="flex items-center gap-1 pl-3.5 pr-2 py-2.5 text-sm text-gray-700 font-medium border-r border-gray-200 focus:outline-none"
                >
                  <span>
                    {countries.find((c) => c.phoneCode === countryCode)?.flag ?? "🌐"}
                  </span>
                  <span>{countryCode}</span>
                  <ChevronDown
                    className={`h-3 w-3 text-gray-400 transition-transform ${
                      codeOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {codeOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setCodeOpen(false)} />
                    <div className="absolute z-20 top-full left-0 mt-1 w-56 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                      {countries.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setCountryCode(c.phoneCode);
                            setCodeOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-orange-50 ${
                            c.phoneCode === countryCode ? "bg-orange-50 text-orange-600" : "text-gray-700"
                          }`}
                        >
                          <span>{c.flag}</span>
                          <span className="flex-1 truncate">{c.name}</span>
                          <span className="text-gray-400">{c.phoneCode}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <input
                name="phone"
                type="tel"
                inputMode="numeric"
                placeholder="50 000 0000"
                value={form.phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  if (digits.length <= 15) {
                    setForm((f) => ({ ...f, phone: digits }));
                  }
                }}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                className="w-full bg-transparent pl-3 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Event Type</label>
            <SearchableSelect
              value={form.event_type}
              onChange={(value) => setForm((f) => ({ ...f, event_type: value }))}
              options={eventTypeOptions}
              placeholder="Select event type"
              loading={eventTypesLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Event Date</label>
            <CustomDatePicker value={eventDateDisplay} onChange={handleEventDateChange} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Number of Guests</label>
            <input
              name="guest_count" value={form.guest_count} onChange={handleChange}
              type="number" placeholder="50"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Event Start Time</label>
            <input
              name="event_start_time" value={form.event_start_time} onChange={handleChange}
              type="time"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Event End Time</label>
            <input
              name="event_end_time" value={form.event_end_time} onChange={handleChange}
              type="time"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          {}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700 block">Delivery Address</label>
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
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">What do you need?</label>
            <textarea
              name="message" value={form.message} onChange={handleChange}
              rows={4} placeholder="Tell us what you need and by when..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !isValid}
          className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-base hover:bg-orange-600 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-6"
        >
          {submitting ? "Sending..." : "Send Urgent Request"}
        </button>
      </div>
    </div>
  );
}