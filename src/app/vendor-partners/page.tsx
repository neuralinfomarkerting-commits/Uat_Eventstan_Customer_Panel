"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FaArrowLeft, 
  FaLink, 
  FaTrophy, 
  FaBolt, 
  FaLock,
  FaChevronDown,
  FaSearch,
  FaTimes,
  FaHome,
  FaCheck
} from "react-icons/fa";
import { customerApi } from "@/api/customerApi";
import type { Country, City } from "@/api/customerApi";
import { categoryService, type CategoryWithMetadata } from "@/services/api/category.service";

interface Step1Data {
  businessName: string;
  yourName: string;
  email: string;
  phone: string;
  websites: string[];
}

interface Step2Data {
  serviceCategoryId: string;
  cityArea: string;
  yearsOfExperience: string;
  description: string;
}

const stripDigits = (value: string) => value.replace(/[0-9]/g, "");
const sanitizeDigits = (value: string) => value.replace(/\D/g, "");

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; name: string; flag?: string }>;
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
  const [selectedLabel, setSelectedLabel] = useState("");

  useEffect(() => {
    const selected = options.find((opt) => opt.id === value);
    setSelectedLabel(selected ? (selected.flag ? `${selected.flag} ${selected.name}` : selected.name) : "");
  }, [value, options]);

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearch("");
  };

  const inputClass = (hasError?: boolean) =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors bg-gray-50 focus:bg-white ${
      hasError
        ? "border-red-400 focus:border-red-500"
        : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
    }`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={`${inputClass(error)} flex items-center justify-between text-left w-full ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <span className={selectedLabel ? "text-gray-900" : "text-gray-400"}>
          {loading ? "Loading..." : selectedLabel || placeholder}
        </span>
        <FaChevronDown
          className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && !loading && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
              <FaSearch className="text-gray-400 flex-shrink-0" />
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
                  <FaTimes />
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
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className="w-full px-4 py-2.5 text-sm text-left hover:bg-orange-50 transition-colors flex items-center justify-between"
                  >
                    <span>
                      {option.flag && `${option.flag} `}
                      {option.name}
                    </span>
                    {value === option.id && (
                      <FaCheck className="text-orange-500 flex-shrink-0" />
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

const Page = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState(false);

  const [categories, setCategories] = useState<CategoryWithMetadata[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [countries, setCountries] = useState<Country[]>([]);
  const [countryCode, setCountryCode] = useState("+971");
  const [codeOpen, setCodeOpen] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    categoryService.fetchCategoriesWithMetadata().then((cats) => {
      if (!cancelled) {
        setCategories(cats);
        setCategoriesLoading(false);
      }
    });
    customerApi.masterData.getCountries().then((list) => {
      if (!cancelled && list.length > 0) {
        setCountries(list);
        setCountryCode(list[0].phoneCode);
      }
    });
    customerApi.masterData.getCities().then((list) => {
      if (!cancelled) {
        setCities(list);
        setCitiesLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const [step1, setStep1] = useState<Step1Data>({
    businessName: "",
    yourName: "",
    email: "",
    phone: "",
    websites: [],
  });

  const [websiteInput, setWebsiteInput] = useState("");

  const addWebsite = () => {
    const value = websiteInput.trim();
    if (!value) return;
    if (step1.websites.includes(value)) {
      setWebsiteInput("");
      return;
    }
    setStep1((prev) => ({ ...prev, websites: [...prev.websites, value] }));
    setWebsiteInput("");
  };

  const removeWebsite = (value: string) => {
    setStep1((prev) => ({
      ...prev,
      websites: prev.websites.filter((w) => w !== value),
    }));
  };

  const [step2, setStep2] = useState<Step2Data>({
    serviceCategoryId: "",
    cityArea: "",
    yearsOfExperience: "",
    description: "",
  });

  const [errors1, setErrors1] = useState<Partial<Step1Data>>({});
  const [errors2, setErrors2] = useState<Partial<Step2Data>>({});

  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateStep1 = () => {
    const errs: Partial<Step1Data> = {};
    if (!step1.businessName.trim()) errs.businessName = "Required";
    if (!step1.yourName.trim()) errs.yourName = "Required";
    if (!step1.email.trim() || !/\S+@\S+\.\S+/.test(step1.email))
      errs.email = "Valid email required";
    if (!step1.phone.trim()) errs.phone = "Required";
    setErrors1(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Partial<Step2Data> = {};
    if (!step2.serviceCategoryId) errs.serviceCategoryId = "Required";
    if (!step2.cityArea) errs.cityArea = "Required";
    if (!step2.yearsOfExperience.trim()) errs.yearsOfExperience = "Required";
    setErrors2(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (websiteInput.trim()) addWebsite();
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setSubmitError(null);
    setSubmitStatus("loading");

    const websiteSocialMedia = step1.websites;

    // Clean phone number: remove leading zeros and non-digits
    const cleanPhone = step1.phone.replace(/\D/g, "").replace(/^0+/, "");
    const fullPhone = `${countryCode}${cleanPhone}`;

    const payload = {
      businessName: step1.businessName,
      yourName: step1.yourName,
      email: step1.email,
      phone: fullPhone,
      websiteSocialMedia,
      serviceCategoryId: step2.serviceCategoryId,
      cityId: step2.cityArea,
      yearsOfExperience: step2.yearsOfExperience
        ? Number(step2.yearsOfExperience.replace(/\D/g, "")) || undefined
        : undefined,
      message: step2.description || undefined,
    };

    try {
      await customerApi.leads.submitVendorLead(payload);
      setSubmitStatus("idle");
      setSubmitted(true);
    } catch (err) {
      setSubmitStatus("error");
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  const inputClass = (hasError?: boolean) =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors bg-gray-50 focus:bg-white ${
      hasError
        ? "border-red-400 focus:border-red-500"
        : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
    }`;

  // Phone number input handler - only allow digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setStep1({ ...step1, phone: value });
  };

  return (
    <div className="min-h-screen" style={{ background: "#fff5eb" }}>
      <div className="absolute top-20 left-20 w-64 h-64 bg-orange-300/30 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-300/25 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-16 sm:py-24">
        {submitted ? (
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <FaCheck className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Application Submitted!
            </h2>
            <p className="text-gray-500 mb-2">
              Thanks, <strong>{step1.yourName}</strong>! We've received your
              application for <strong>{step1.businessName}</strong>.
            </p>
            <p className="text-gray-500 mb-8">
              Our team will review it and get back to you at{" "}
              <strong>{step1.email}</strong> within 2–3 business days.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors"
            >
              <FaArrowLeft />
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-orange-100 rounded-full px-4 py-2 text-sm text-orange-600 font-medium mb-5 shadow-sm">
                <FaHome className="w-4 h-4" />
                Vendor Partners
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                List Your{" "}
                <span className="text-orange-500 relative inline-block">
                  Service
                  <svg
                    className="absolute -bottom-1 left-0 w-full"
                    viewBox="0 0 200 8"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 6 Q100 0 200 6"
                      stroke="#f97316"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="text-gray-500 text-base max-w-md mx-auto">
                Join hundreds of trusted vendors on EventStan and connect with
                clients planning weddings, corporate events, birthdays, and
                more.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaHome className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">
                    List Your Service
                  </h2>
                  <p className="text-sm text-gray-500">
                    Join EventStan as a vendor partner
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-orange-500 text-white">
                    1
                  </div>
                  <span
                    className={`text-sm font-medium ${step === 1 ? "text-gray-900" : "text-gray-400"}`}
                  >
                    Business Info
                  </span>
                </div>
                <div
                  className="flex-1 h-px mx-1"
                  style={{ background: step === 2 ? "#f97316" : "#e5e7eb" }}
                />
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === 2
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    2
                  </div>
                  <span
                    className={`text-sm font-medium ${step === 2 ? "text-gray-900" : "text-gray-400"}`}
                  >
                    Service Details
                  </span>
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Business Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bloom & Petal Events"
                        value={step1.businessName}
                        onChange={(e) =>
                          setStep1({
                            ...step1,
                            businessName: stripDigits(e.target.value),
                          })
                        }
                        className={inputClass(!!errors1.businessName)}
                      />
                      {errors1.businessName && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors1.businessName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={step1.yourName}
                        onChange={(e) =>
                          setStep1({
                            ...step1,
                            yourName: stripDigits(e.target.value),
                          })
                        }
                        className={inputClass(!!errors1.yourName)}
                      />
                      {errors1.yourName && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors1.yourName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="hello@yourbusiness.com"
                        value={step1.email}
                        onChange={(e) =>
                          setStep1({ ...step1, email: e.target.value })
                        }
                        className={inputClass(!!errors1.email)}
                      />
                      {errors1.email && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors1.email}
                        </p>
                      )}
                    </div>

                    {/* Phone — signup-page style */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <div
                        className={`relative flex items-center bg-white border rounded-xl transition-all ${
                          errors1.phone
                            ? "border-red-400 ring-2 ring-red-100"
                            : phoneFocused
                            ? "border-orange-400 ring-2 ring-orange-100"
                            : "border-gray-200"
                        }`}
                      >
                        {/* Country code dropdown */}
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
                              {countries.find((c) => c.phoneCode === countryCode)?.flag ?? "🌐"}
                            </span>
                            <span>{countryCode}</span>
                            <svg
                              className={`w-3 h-3 text-gray-400 transition-transform ${codeOpen ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
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
                          type="tel"
                          inputMode="numeric"
                          placeholder="50 000 0000"
                          value={step1.phone}
                          onChange={handlePhoneChange}
                          onFocus={() => setPhoneFocused(true)}
                          onBlur={() => setPhoneFocused(false)}
                          className="w-full bg-transparent pl-3 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none"
                        />
                      </div>
                      {errors1.phone && (
                        <p className="text-xs text-red-500 mt-1">{errors1.phone}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1.5">
                        Enter digits only. We'll format it as {countryCode}XXX...
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Website / Social Media
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add links like your website, Instagram, Facebook"
                        value={websiteInput}
                        onChange={(e) => setWebsiteInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addWebsite();
                          }
                        }}
                        className="w-full px-4 py-3 rounded-full border-2 border-orange-300 text-sm outline-none transition-colors bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                      <button
                        type="button"
                        onClick={addWebsite}
                        disabled={!websiteInput.trim()}
                        className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Add link"
                      >
                        <FaLink className="w-4 h-4" />
                      </button>
                    </div>

                    {step1.websites.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {step1.websites.map((site) => (
                          <span
                            key={site}
                            className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full pl-3.5 pr-2.5 py-1.5 text-sm text-orange-600 font-medium"
                          >
                            {site}
                            <button
                              type="button"
                              onClick={() => removeWebsite(site)}
                              aria-label={`Remove ${site}`}
                              className="text-orange-500 hover:text-orange-700 transition-colors"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleContinue}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-full font-semibold text-sm transition-colors mt-2 shadow-md hover:shadow-lg"
                  >
                    Continue →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Service Category <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        value={step2.serviceCategoryId}
                        onChange={(value) =>
                          setStep2({
                            ...step2,
                            serviceCategoryId: value,
                          })
                        }
                        options={categories.map((cat) => ({
                          id: cat.id,
                          name: cat.name,
                        }))}
                        placeholder="Select category"
                        loading={categoriesLoading}
                        error={!!errors2.serviceCategoryId}
                      />
                      {errors2.serviceCategoryId && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors2.serviceCategoryId}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        City / Area <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        value={step2.cityArea}
                        onChange={(value) =>
                          setStep2({
                            ...step2,
                            cityArea: value,
                          })
                        }
                        options={cities.map((city) => ({
                          id: city.id,
                          name: city.name,
                        }))}
                        placeholder="Select city / area"
                        loading={citiesLoading}
                        error={!!errors2.cityArea}
                      />
                      {errors2.cityArea && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors2.cityArea}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Years of Experience <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 5"
                      value={step2.yearsOfExperience}
                      onChange={(e) =>
                        setStep2({
                          ...step2,
                          yearsOfExperience: sanitizeDigits(e.target.value),
                        })
                      }
                      className={inputClass(!!errors2.yearsOfExperience)}
                    />
                    {errors2.yearsOfExperience && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors2.yearsOfExperience}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tell us about your service
                    </label>
                    <textarea
                      placeholder="Describe what makes your service special, the events you typically cover, your packages, etc."
                      value={step2.description}
                      onChange={(e) =>
                        setStep2({
                          ...step2,
                          description: e.target.value.slice(0, 500),
                        })
                      }
                      maxLength={500}
                      rows={5}
                      className={`${inputClass()} resize-none`}
                    />
                    <p className="mt-1 text-right text-xs text-gray-400">
                      {step2.description.length}/500 characters
                    </p>
                  </div>

                  {submitStatus === "error" && submitError && (
                    <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                      {submitError}
                    </p>
                  )}

                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => setStep(1)}
                      disabled={submitStatus === "loading"}
                      className="flex-1 border-2 border-gray-200 text-gray-700 py-3.5 rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitStatus === "loading"}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-full font-semibold text-sm transition-colors shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitStatus === "loading"
                        ? "Submitting..."
                        : "Submit Application"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              {[
                { icon: FaTrophy, text: "500+ Trusted Vendors" },
                { icon: FaBolt, text: "Quick Review — 2–3 Days" },
                { icon: FaLock, text: "Your Info is Safe" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-600 shadow-sm border border-white flex items-center gap-2"
                >
                  <Icon className="w-4 h-4 text-orange-500" />
                  {text}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;