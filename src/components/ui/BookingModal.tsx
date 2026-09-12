"use client";
import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import { Calendar, ChevronDown, Search, X, Check, ImageOff } from "lucide-react";
import { getEventMasters, customerApi } from "@/api/customerApi";
import type { Country } from "@/api/customerApi";
import { useAuth } from "@/lib/AuthContext";
import { Package, Service } from "@/types";

interface Props {
  pkg?: Package;
  service?: Service;
  onClose: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  eventType: string;
  numGuests: string;
}

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
  minIsoDate: string;
  error?: boolean;
}

const CustomDatePicker = ({ value, onChange, minIsoDate, error = false }: CustomDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelWidth = 288; // w-72

  const selectedIso = toIsoDate(value);
  const initial = selectedIso ? new Date(selectedIso) : new Date(minIsoDate);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const minDate = new Date(minIsoDate);
  minDate.setHours(0, 0, 0, 0);

  const clampLeft = (left: number) =>
    Math.min(left, window.innerWidth - panelWidth - 8);

  const computeInitialCoords = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCoords({
      top: rect.bottom + 8,
      left: clampLeft(rect.left),
      width: rect.width,
    });
  };

  const openPicker = () => {
    const iso = toIsoDate(value);
    const base = iso ? new Date(iso) : new Date(minIsoDate);
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    computeInitialCoords();
    setIsOpen(true);
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    const panelHeight = panelRef.current?.offsetHeight;
    if (!rect || !panelHeight) return;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < panelHeight + 8 && rect.top > panelHeight + 8;

    setCoords({
      top: openUpward ? rect.top - panelHeight - 8 : rect.bottom + 8,
      left: clampLeft(rect.left),
      width: rect.width,
    });
  }, [isOpen, viewMonth, viewYear]);

  useEffect(() => {
    if (!isOpen) return;
    const reposition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      const panelHeight = panelRef.current?.offsetHeight;
      if (!rect || !panelHeight) return;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < panelHeight + 8 && rect.top > panelHeight + 8;
      setCoords({
        top: openUpward ? rect.top - panelHeight - 8 : rect.bottom + 8,
        left: clampLeft(rect.left),
        width: rect.width,
      });
    };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [isOpen]);

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
        ref={buttonRef}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openPicker())}
        className={`w-full flex items-center px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors bg-white pl-9 text-left relative ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        }`}
      >
        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value || "dd-mm-yyyy"}
        </span>
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div
            ref={panelRef}
            className="fixed z-[101] w-72 bg-white rounded-xl border border-gray-200 shadow-lg p-3"
            style={{ top: coords.top, left: coords.left }}
          >
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
        </>,
        document.body
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
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearch("");
  };

  const computeInitialCoords = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCoords({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  };

  const openDropdown = () => {
    computeInitialCoords();
    setIsOpen(true);
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    const panelHeight = panelRef.current?.offsetHeight;
    if (!rect || !panelHeight) return;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < panelHeight + 8 && rect.top > panelHeight + 8;

    setCoords({
      top: openUpward ? rect.top - panelHeight - 8 : rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, [isOpen, filteredOptions.length]);

  useEffect(() => {
    if (!isOpen) return;
    const reposition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      const panelHeight = panelRef.current?.offsetHeight;
      if (!rect || !panelHeight) return;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < panelHeight + 8 && rect.top > panelHeight + 8;
      setCoords({
        top: openUpward ? rect.top - panelHeight - 8 : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [isOpen]);

  const inputClass = () =>
    `w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors bg-white ${
      error
        ? "border-red-400 focus:border-red-500"
        : "border-gray-200 focus:border-orange-400"
    }`;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && !loading && (isOpen ? setIsOpen(false) : openDropdown())}
        disabled={disabled || loading}
        className={`${inputClass()} flex items-center justify-between text-left w-full ${
          disabled || loading ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {loading ? "Loading..." : value || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && !loading && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div
            ref={panelRef}
            className="fixed z-[101] bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden"
            style={{ top: coords.top, left: coords.left, width: coords.width }}
          >
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
            <div className="max-h-52 overflow-y-auto py-1">
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
        </>,
        document.body
      )}
    </div>
  );
};

export default function BookingModal({ pkg, service, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [form, setForm] = useState<FormData>({
    fullName: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    eventDate: "",
    eventStartTime: "",
    eventEndTime: "",
    eventType: "",
    numGuests: "",
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const [countryCode, setCountryCode] = useState("+971");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    let cancelled = false;
    customerApi.masterData.getCountries().then((list) => {
      if (!cancelled && list.length > 0) setCountries(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const rawPhone = user?.phone ?? "";
    const { code, number } = splitPhone(rawPhone, countries);
    setCountryCode(code);
    setPhoneNumber(number);
  }, [user, countries]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      onClose();
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname || "/")}`);
    }
  }, [user]);

  const [eventTypeOptions, setEventTypeOptions] = useState<string[]>(FALLBACK_EVENT_TYPES);
  const [eventTypesLoading, setEventTypesLoading] = useState(true);
  const [eventTypeIdByName, setEventTypeIdByName] = useState<Record<string, string>>({});

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

  const minEventDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const eventDateDisplay = form.eventDate ? fromIsoDate(form.eventDate) : "";
  const handleEventDateChange = (ddmmyyyy: string) => {
    setForm((f) => ({ ...f, eventDate: toIsoDate(ddmmyyyy) }));
  };

  const p = pkg as any;
  const basePrice = p?.price ?? service?.price_min ?? 0;
  const priceUnit = p?.price_unit ?? service?.price_unit ?? "day";
  const title = p?.title ?? p?.name ?? service?.title ?? "";
  const vendorName = service?.vendor_name ?? "";
  const category = service?.category ?? "";
  const imageUrl = p?.imageUrl ?? p?.image_url ?? service?.image_url ?? "";
  const isRental = String(category).toLowerCase().includes("rental") || Boolean(p?.is_rental ?? p?.isRental);
  const isPerPerson = priceUnit.toLowerCase().includes("person");
  const isPerDay = priceUnit.toLowerCase().includes("day");

  const minPersons = Number(p?.min_persons ?? p?.minPersons ?? 1) || 1;
  const maxPersonsRaw = p?.max_persons ?? p?.maxPersons ?? p?.max_guests ?? p?.maxGuests;
  const maxPersons = maxPersonsRaw != null ? Number(maxPersonsRaw) : undefined;
  const personsCount = Math.max(minPersons, Number(form.numGuests) || minPersons);

  const [quantity, setQuantity] = useState(1);
  const [numDays, setNumDays] = useState(1);

  useEffect(() => {
    if (isPerPerson && !form.numGuests) {
      setForm((f) => ({ ...f, numGuests: String(minPersons) }));
    }
  }, [isPerPerson]);

  const setPersons = (updater: (n: number) => number) => {
    setForm((f) => {
      const current = Math.max(minPersons, Number(f.numGuests) || minPersons);
      let next = updater(current);
      next = Math.max(minPersons, next);
      if (maxPersons != null) next = Math.min(maxPersons, next);
      return { ...f, numGuests: String(next) };
    });
  };

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors bg-white";

  const isFormValid =
    !!form.fullName &&
    !!form.email &&
    !!form.eventDate &&
    form.eventDate >= minEventDate &&
    !!form.eventStartTime &&
    !!form.eventEndTime &&
    !!form.eventType.trim() &&
    (!isPerPerson || !!form.numGuests);

  const handleContinue = () => {
    if (!user) {
      onClose();
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    const packageId = p?.id;
    if (!packageId) {
      setError("This item can't be booked online right now — missing package reference.");
      return;
    }

    if (!isFormValid) return;

    const isPromotional = Boolean(p?.isPromotion ?? p?.is_promotion ?? p?.promotionId ?? p?.promoId);

    const eventTypeName = form.eventType.trim() || "Event";
    const eventTypeId = eventTypeIdByName[eventTypeName] ?? "";

    const fullPhone = phoneNumber.trim() ? `${countryCode}${phoneNumber.trim()}` : "";

    const bookingDraft = {
      userId: user.id,
      packageId,
      isPromotional,
      title,
      vendorName,
      category,
      basePrice,
      priceUnit,
      isRental,
      isPerDay,
      isPerPerson,
      minPersons,
      maxPersons: maxPersons ?? null,
      fullName: form.fullName,
      email: form.email,
      phone: fullPhone,
      eventDate: form.eventDate,
      eventDateDisplay,
      eventStartTime: form.eventStartTime,
      eventEndTime: form.eventEndTime,
      eventType: eventTypeName,
      eventTypeId,
      numGuests: form.numGuests,
      quantity,
      numDays,
    };

    sessionStorage.setItem("bookingDraft", JSON.stringify(bookingDraft));
    onClose();
    router.push("/payment");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        <div className="bg-gray-900 px-6 pt-6 pb-5">
          <div className="flex items-start justify-between mb-1 gap-3">
            <div className="flex items-start gap-3 min-w-0">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-white/10"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <ImageOff className="w-5 h-5 text-gray-500" />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-orange-400 text-xs font-semibold uppercase tracking-wider">
                  {category}
                </span>
                <h2 className="text-white font-bold text-xl mt-0.5 leading-tight truncate">{title}</h2>
                {vendorName && (
                  <p className="text-gray-400 text-sm mt-0.5">by {vendorName}</p>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-orange-400 font-bold text-2xl">
                AED{basePrice.toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                1 x AED{basePrice.toLocaleString()} {priceUnit}
              </p>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-3">Your Details</p>
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Full Name <span className="text-orange-400">*</span>
                </label>
                <input
                  value={form.fullName}
                  readOnly
                  placeholder="Full name"
                  className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Email <span className="text-orange-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  readOnly
                  placeholder="you@example.com"
                  className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Phone</label>
              <div className="w-full flex items-center gap-2 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 text-gray-500">
                {phoneNumber ? (
                  <>
                    <span className="text-base">
                      {countries.find((c) => c.phoneCode === countryCode)?.flag ?? "🇦🇪"}
                    </span>
                    <span>{countryCode} {phoneNumber}</span>
                  </>
                ) : (
                  <span className="text-gray-400">No phone number on file</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                To change this, update your number in My Profile.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                Event Date <span className="text-orange-400">*</span>
              </label>
              <CustomDatePicker
                value={eventDateDisplay}
                onChange={handleEventDateChange}
                minIsoDate={minEventDate}
                error={!!form.eventDate && form.eventDate < minEventDate}
              />
              <p className="text-xs text-gray-400 mt-1">
                At least 2 days&apos; notice needed — earliest{" "}
                {new Date(minEventDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-")}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Start Time <span className="text-orange-400">*</span>
                </label>
                <input
                  type="time"
                  value={form.eventStartTime}
                  onChange={set("eventStartTime")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  End Time <span className="text-orange-400">*</span>
                </label>
                <input
                  type="time"
                  value={form.eventEndTime}
                  onChange={set("eventEndTime")}
                  className={inputClass}
                />
              </div>
            </div>

            <div className={isPerPerson ? "" : "grid grid-cols-2 gap-3"}>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Event Type</label>
                <SearchableSelect
                  value={form.eventType}
                  onChange={(value) => setForm((f) => ({ ...f, eventType: value }))}
                  options={eventTypeOptions}
                  placeholder="Select event type"
                  loading={eventTypesLoading}
                />
              </div>
              {!isPerPerson && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Number of Guests</label>
                  <input
                    value={form.numGuests}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, numGuests: e.target.value.replace(/\D/g, "") }))
                    }
                    inputMode="numeric"
                    type="text"
                    placeholder={p?.max_guests ? `Max ${p.max_guests}` : "Guests"}
                    className={inputClass}
                  />
                </div>
              )}
            </div>

            {(isRental || isPerDay) && (
              <div className={isRental && isPerDay ? "grid grid-cols-2 gap-3" : ""}>
                {isRental && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-semibold text-gray-700 mb-3 block">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-gray-900">{quantity}</span>
                      <button
                        type="button"
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
                {isPerDay && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-semibold text-gray-700 mb-3 block">Duration (days)</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setNumDays((n) => Math.max(1, n - 1))}
                        className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-gray-900">{numDays}</span>
                      <button
                        type="button"
                        onClick={() => setNumDays((n) => n + 1)}
                        className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isPerPerson && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3">
                  Persons
                  {(minPersons > 1 || maxPersons) && (
                    <span className="text-gray-400 font-normal">
                      {" "}
                      (min {minPersons}
                      {maxPersons ? ` – max ${maxPersons}` : ""})
                    </span>
                  )}
                  <span className="text-orange-400"> *</span>
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPersons((n) => n - 1)}
                    disabled={personsCount <= minPersons}
                    className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-gray-900">{personsCount}</span>
                  <button
                    type="button"
                    onClick={() => setPersons((n) => n + 1)}
                    disabled={maxPersons != null && personsCount >= maxPersons}
                    className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 pt-2">
          {error && (
            <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            onClick={handleContinue}
            disabled={!isFormValid}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Continue
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}