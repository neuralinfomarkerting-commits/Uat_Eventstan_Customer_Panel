"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CheckCircle,
  Clock,
  Star,
  Mail,
  Phone,
  Calendar,
  Users,
  Loader2,
  ChevronDown,
  Search,
  X,
  Check,
} from "lucide-react";
import { customerApi, getEventMasters } from "@/api/customerApi";
import type { Country } from "@/api/customerApi";
import { showError, showSuccess } from "@/lib/toast";
import {
  categoryService,
  type Category,
} from "@/services/api/category.service";

const budgetOptions = [
  { label: "Under AED 1,000", min: 1, max: 1000 },
  { label: "AED 1,000 – 5,000", min: 1000, max: 5000 },
  { label: "AED 5,000 – 15,000", min: 5000, max: 15000 },
  { label: "AED 15,000 – 30,000", min: 15000, max: 30000 },
  { label: "AED 30,000+", min: 30000, max: 1000000 },
];

const stripDigits = (value: string) => value.replace(/[0-9]/g, "");
const sanitizeDigits = (value: string) => value.replace(/\D/g, "");

const today = new Date();
const todayStr = today.toISOString().split("T")[0]; // yyyy-mm-dd (ISO, used for min-date validation)

// ---- dd-mm-yyyy helpers ----

// dd-mm-yyyy -> yyyy-mm-dd (ISO). Returns "" if incomplete/invalid.
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

// yyyy-mm-dd (ISO) -> dd-mm-yyyy for display
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
  value: string; // dd-mm-yyyy or ""
  onChange: (ddmmyyyy: string) => void;
  error?: boolean;
}

const CustomDatePicker = ({ value, onChange, error = false }: CustomDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedIso = toIsoDate(value);
  const initial = selectedIso ? new Date(selectedIso) : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth()); // 0-indexed

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const openPicker = () => {
    const iso = toIsoDate(value);
    const base = iso ? new Date(iso) : new Date();
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
  const startWeekday = firstOfMonth.getDay(); // 0 = Sunday

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handlePick = (day: number) => {
    const picked = new Date(viewYear, viewMonth, day);
    picked.setHours(0, 0, 0, 0);
    if (picked < startOfToday) return; // no past dates
    const iso = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`;
    onChange(fromIsoDate(iso));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openPicker())}
        className={`w-full flex items-center px-4 py-3 rounded-xl border text-sm outline-none transition-colors bg-gray-50 focus:bg-white pl-9 text-left relative ${
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
                <div
                  key={d}
                  className="text-center text-xs font-medium text-gray-400 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (day === null) return <div key={idx} />;
                const cellDate = new Date(viewYear, viewMonth, day);
                cellDate.setHours(0, 0, 0, 0);
                const isPast = cellDate < startOfToday;
                const isSelected =
                  selectedIso ===
                  `${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`;
                const isToday =
                  cellDate.getTime() === startOfToday.getTime();

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isPast}
                    onClick={() => handlePick(day)}
                    className={`h-8 w-8 text-xs rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-orange-500 text-white font-semibold"
                        : isPast
                        ? "text-gray-300 cursor-not-allowed"
                        : isToday
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

type SubmitStatus = "idle" | "loading" | "success" | "error";

interface MultiSearchableSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
  placeholder: string;
  loading?: boolean;
  error?: boolean;
}

const MultiSearchableSelect = ({
  values,
  onChange,
  options,
  placeholder,
  loading = false,
  error = false,
}: MultiSearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOption = (option: string) => {
    onChange(
      values.includes(option)
        ? values.filter((v) => v !== option)
        : [...values, option]
    );
  };

  const inputClass = () =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors bg-gray-50 focus:bg-white ${
      error
        ? "border-red-400 focus:border-red-500"
        : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
    }`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        className={`${inputClass()} flex items-center justify-between text-left w-full ${
          loading ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <span className={values.length ? "text-gray-900 truncate" : "text-gray-400"}>
          {loading
            ? "Loading services..."
            : values.length
            ? values.join(", ")
            : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs px-2.5 py-1"
            >
              {v}
              <button
                type="button"
                onClick={() => toggleOption(v)}
                className="hover:text-orange-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {isOpen && !loading && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                autoFocus
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No results found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleOption(option)}
                    className="w-full px-4 py-2.5 text-sm text-left hover:bg-orange-50 transition-colors flex items-center justify-between"
                  >
                    <span>{option}</span>
                    {values.includes(option) && (
                      <Check className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    )}
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

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  error?: boolean;
  disabled?: boolean;
}

const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder,
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
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors bg-gray-50 focus:bg-white ${
      error
        ? "border-red-400 focus:border-red-500"
        : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
    }`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`${inputClass()} flex items-center justify-between text-left w-full ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
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
                <button
                  onClick={() => setSearch("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No results found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className="w-full px-4 py-2.5 text-sm text-left hover:bg-orange-50 transition-colors flex items-center justify-between"
                  >
                    <span>{option}</span>
                    {value === option && (
                      <Check className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    )}
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

export default function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryCode, setCountryCode] = useState("+971");
  const [codeOpen, setCodeOpen] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [eventType, setEventType] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Displayed as dd-mm-yyyy; converted to ISO (yyyy-mm-dd) only on submit
  const [preferredEventDate, setPreferredEventDate] = useState("");
  const [dateError, setDateError] = useState(false);

  const [expectedGuestCount, setExpectedGuestCount] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [budgetLabel, setBudgetLabel] = useState<string | null>(null);
  const [services, setServices] = useState<string[]>([]);
  const [currency, setCurrency] = useState("AED");

  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fallback used only if GET /event-masters fails, so the dropdown still
  // has something usable instead of rendering empty.
  const FALLBACK_EVENT_TYPES = [
    "Wedding",
    "Corporate",
    "Birthday",
    "Anniversary",
    "Baby Shower",
    "Graduation",
    "Bachelor Party",
    "Bachelorette Party",
    "Engagement",
    "Reunion",
    "Conference",
    "Seminar",
    "Workshop",
    "Team Building",
    "Holiday Party",
    "Award Ceremony",
    "Fundraiser",
    "Gala Dinner",
    "Product Launch",
    "Trade Show",
    "Other",
  ];

  const [eventTypeOptions, setEventTypeOptions] = useState<string[]>(FALLBACK_EVENT_TYPES);

  useEffect(() => {
    let cancelled = false;
    customerApi.masterData.getCountries().then((list) => {
      if (!cancelled && list.length > 0) {
        setCountries(list);
        setCountryCode(list[0].phoneCode);
      }
    });
    categoryService.fetchCategories().then((cats) => {
      if (!cancelled) {
        setCategories(cats.filter((c) => c.isActive));
        setCategoriesLoading(false);
      }
    });
    // Event Type dropdown — driven by GET /event-masters so new event
    // types added on the backend show up automatically.
    getEventMasters()
      .then((events) => {
        if (!cancelled && events.length > 0) {
          setEventTypeOptions(events.map((e) => e.eventName));
        }
      })
      .catch((err) => {
        console.error("Error fetching event types:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (
      !fullName ||
      !email ||
      !phone ||
      !eventType ||
      !budgetLabel ||
      services.length === 0
    ) {
      setStatus("error");
      setErrorMsg(
        "Please fill in all required fields (Name, Email, Phone, Event Type, Budget Range, Services Needed)."
      );
      return;
    }

    // Validate date if the user entered one
    let isoDate: string | undefined;
    if (preferredEventDate) {
      const converted = toIsoDate(preferredEventDate);
      if (!converted) {
        setStatus("error");
        setDateError(true);
        setErrorMsg("Please enter a valid date in dd-mm-yyyy format.");
        return;
      }
      if (converted < todayStr) {
        setStatus("error");
        setDateError(true);
        setErrorMsg("Preferred event date cannot be in the past.");
        return;
      }
      isoDate = converted;
    }

    const selectedBudget = budgetOptions.find((b) => b.label === budgetLabel);
    const cleanPhone = phone.replace(/\D/g, "").replace(/^0+/, "");
    const fullPhone = `${countryCode}${cleanPhone}`;

    const payload = {
      fullName,
      email,
      phone: fullPhone,
      eventType,
      preferredEventDate: isoDate, // sent to backend as yyyy-mm-dd (ISO)
      expectedGuestCount: expectedGuestCount
        ? Number(expectedGuestCount)
        : undefined,
      budgetRange: selectedBudget
        ? {
            min: selectedBudget.min,
            max: selectedBudget.max,
            currency,
          }
        : undefined,
      servicesNeeded: services,
      additionalDetails: additionalDetails || undefined,
    };

    try {
      setStatus("loading");
      await customerApi.leads.submitUserLead(payload);
      setStatus("success");
      setFullName("");
      setEmail("");
      setPhone("");
      setEventType("");
      setPreferredEventDate("");
      setDateError(false);
      setExpectedGuestCount("");
      setAdditionalDetails("");
      setBudgetLabel(null);
      setServices([]);
      showSuccess("Your request has been submitted successfully!");
    } catch (err) {
      setStatus("error");
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setErrorMsg(msg);
      showError(msg);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-widest text-orange-500">
            GET IN TOUCH
          </p>
          <h1
            className="mt-3 text-4xl font-bold text-neutral-900 sm:text-5xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Tell Us About Your Event
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-500">
            Fill in your event details and our team will call you back within 24
            hours with personalised vendor recommendations and a free
            consultation.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <div className="space-y-6">
              <Feature
                icon={<CheckCircle className="h-5 w-5 text-orange-500" />}
                title="Free Consultation"
                desc="No cost, no commitment — just expert advice tailored to your event."
              />
              <Feature
                icon={<Clock className="h-5 w-5 text-orange-500" />}
                title="24-Hour Callback"
                desc="Our team reaches out within one business day to discuss your vision."
              />
              <Feature
                icon={<Star className="h-5 w-5 text-orange-500" />}
                title="Curated Vendors"
                desc="We handpick the best vendors for your budget and style."
              />
            </div>

            <div className="relative h-64 w-full overflow-hidden rounded-2xl sm:h-80 lg:h-full">
              <Image
                src="/images/contact-us/contact-us.jpg"
                alt="Beautifully set event table with floral centerpiece"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <h3 className="text-xl font-semibold text-neutral-900">
                  Thank you!
                </h3>
                <p className="max-w-sm text-sm text-neutral-500">
                  Your request has been submitted. Our team will call you back
                  within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-4 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-300"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-colors bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      value={fullName}
                      onChange={(e) => setFullName(stripDigits(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        placeholder="jane@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-colors bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative flex items-center bg-white border rounded-xl transition-all ${
                        status === "error" && errorMsg?.includes("Phone")
                          ? "border-red-400 ring-2 ring-red-100"
                          : phoneFocused
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
                          className="flex items-center gap-1 pl-3.5 pr-2 py-3 text-sm text-gray-700 font-medium border-r border-gray-200 focus:outline-none"
                        >
                          <span>
                            {countries.find((c) => c.phoneCode === countryCode)
                              ?.flag ?? "🌐"}
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
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setCodeOpen(false)}
                            />
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
                                    c.phoneCode === countryCode
                                      ? "bg-orange-50 text-orange-600"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <span>{c.flag}</span>
                                  <span className="flex-1 truncate">
                                    {c.name}
                                  </span>
                                  <span className="text-gray-400">
                                    {c.phoneCode}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="50 000 0000"
                        value={phone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          if (digits.length <= 15) {
                            setPhone(digits);
                          }
                        }}
                        onFocus={() => setPhoneFocused(true)}
                        onBlur={() => setPhoneFocused(false)}
                        className="w-full bg-transparent pl-3 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      Enter digits only (max 15 digits). We'll format it as {countryCode}XXX...
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Event Type <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      value={eventType}
                      onChange={setEventType}
                      options={eventTypeOptions}
                      placeholder="Select event type..."
                      error={status === "error" && errorMsg?.includes("Event Type")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Preferred Event Date
                    </label>
                    <CustomDatePicker
                      value={preferredEventDate}
                      onChange={(val) => {
                        setPreferredEventDate(val);
                        setDateError(false);
                      }}
                      error={dateError}
                    />
                    {dateError && (
                      <p className="text-xs text-red-500 mt-1.5">
                        Enter a valid date (dd-mm-yyyy), not in the past.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Expected Guest Count
                    </label>
                    <div className="relative">
                      <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min={1}
                        step={1}
                        placeholder="e.g. 100"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-colors bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 pl-9"
                        value={expectedGuestCount}
                        onChange={(e) => {
                          const digits = sanitizeDigits(e.target.value);
                          setExpectedGuestCount(
                            digits && Number(digits) > 0
                              ? String(Number(digits))
                              : ""
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Budget Range <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {budgetOptions.map((b) => (
                      <button
                        type="button"
                        key={b.label}
                        onClick={() => setBudgetLabel(b.label)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          budgetLabel === b.label
                            ? "border-orange-500 bg-orange-50 text-orange-600"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Services Needed <span className="text-red-500">*</span>
                  </label>
                  <MultiSearchableSelect
                    values={services}
                    onChange={setServices}
                    options={categories.map((c) => c.name)}
                    placeholder="Select services..."
                    loading={categoriesLoading}
                    error={status === "error" && errorMsg?.includes("Service")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Additional Details
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us more about your event vision, special requirements, or any questions..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-colors bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
                    value={additionalDetails}
                    onChange={(e) =>
                      setAdditionalDetails(e.target.value.slice(0, 500))
                    }
                    maxLength={500}
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">
                    {additionalDetails.length}/500 characters
                  </p>
                </div>

                {status === "error" && errorMsg && (
                  <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "loading" ? (
                    <>
                      Submitting...
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      Request a Callback
                      <Phone className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-neutral-900">{title}</h3>
        <p className="mt-1 text-sm text-neutral-500">{desc}</p>
      </div>
    </div>
  );
}