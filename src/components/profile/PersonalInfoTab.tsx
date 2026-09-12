"use client";

import { useState } from "react";
import { ChevronDown, Search, X, Calendar } from "lucide-react";
import type { Country } from "@/api/customerApi";
import SearchableSelect from "@/components/ui/SearchableSelect";

interface PersonalInfoTabProps {
  user: { name: string; avatar: string };
  avatarColor: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  saving: boolean;
  countryCode: string;
  countries: Country[];
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onCountryCodeChange: (v: string) => void;
  onGenderChange: (v: string) => void;
  onDobChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const weekDayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const pad2 = (n: number) => String(n).padStart(2, "0");
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);

const toIsoDate = (ddmmyyyy: string) => {
  const match = ddmmyyyy.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return "";
  const [, dd, mm, yyyy] = match;
  const iso = `${yyyy}-${mm}-${dd}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return iso;
};

const fromIsoDate = (iso: string) => {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, yyyy, mm, dd] = match;
  return `${dd}-${mm}-${yyyy}`;
};

function MonthYearDropdown({
  label, options, value, onChange,
}: { label: string; options: (string | number)[]; value: string | number; onChange: (v: string | number) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-sm font-semibold text-gray-800 bg-transparent outline-none cursor-pointer hover:bg-gray-100 rounded-lg px-2 py-1 flex items-center gap-1"
      >
        {label}
        <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute z-30 top-full left-1/2 -translate-x-1/2 mt-1 w-28 max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full" style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}>
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-sm text-center hover:bg-orange-50 ${
                  opt === value ? "bg-orange-500 text-white font-semibold hover:bg-orange-500" : "text-gray-700"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface DobDatePickerProps {
  value: string;
  onChange: (ddmmyyyy: string) => void;
}

function DobDatePicker({ value, onChange }: DobDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedIso = toIsoDate(value);
  const initial = selectedIso ? new Date(selectedIso) : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

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
  const startWeekday = firstOfMonth.getDay();

  const cells = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handlePick = (day: number) => {
    const picked = new Date(viewYear, viewMonth, day);
    picked.setHours(0, 0, 0, 0);
    if (picked > startOfToday) return;
    const iso = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`;
    onChange(fromIsoDate(iso));
    setIsOpen(false);
  };

  return (
    <div className="relative flex-1">
      <button
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openPicker())}
        className="w-full flex items-center px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none transition-colors bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 pl-9 text-left relative"
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
            <div className="flex items-center justify-between mb-2 gap-1">
              <button type="button" onClick={goPrevMonth} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 flex-shrink-0">
                ‹
              </button>
              <div className="flex items-center gap-1">
                <MonthYearDropdown
                  label={monthNames[viewMonth]}
                  options={monthNames}
                  value={monthNames[viewMonth]}
                  onChange={(m) => setViewMonth(monthNames.indexOf(m as string))}
                />
                <MonthYearDropdown
                  label={String(viewYear)}
                  options={yearOptions}
                  value={viewYear}
                  onChange={(y) => setViewYear(Number(y))}
                />
              </div>
              <button type="button" onClick={goNextMonth} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 flex-shrink-0">
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
                const isFuture = cellDate > startOfToday;
                const isSelected = selectedIso === `${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`;
                const isToday = cellDate.getTime() === startOfToday.getTime();

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isFuture}
                    onClick={() => handlePick(day)}
                    className={`h-8 w-8 text-xs rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-orange-500 text-white font-semibold"
                        : isFuture
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
}

export default function PersonalInfoTab({
  user, avatarColor, firstName, lastName, email, phone, gender, dob, saving,
  countryCode, countries,
  onFirstNameChange, onLastNameChange, onPhoneChange, onCountryCodeChange, onGenderChange, onDobChange, onSubmit,
}: PersonalInfoTabProps) {
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeSearch, setCodeSearch] = useState("");
  const [phoneFocused, setPhoneFocused] = useState(false);

  const filteredCountries = countries.filter((c) => {
    const q = codeSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phoneCode.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-4 sm:px-8 py-5 border-b border-gray-100 flex items-center gap-3">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
          {user.avatar}
        </div>
        <div>
          <p className="text-gray-500 text-xs sm:text-sm">Hello, {firstName}</p>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Welcome to your Profile</h1>
        </div>
      </div>

      <form onSubmit={onSubmit} className="px-4 sm:px-8 py-6">
        <div className="border-l-2 border-orange-400 pl-4 sm:pl-6 space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6">
            <label className="sm:w-28 flex-shrink-0 text-sm text-gray-600 font-medium">First Name</label>
            <input type="text" value={firstName} onChange={e => onFirstNameChange(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6">
            <label className="sm:w-28 flex-shrink-0 text-sm text-gray-600 font-medium">Last Name</label>
            <input type="text" value={lastName} onChange={e => onLastNameChange(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"/>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6">
            <label className="sm:w-28 flex-shrink-0 text-sm text-gray-600 font-medium">Email</label>
            <input type="email" value={email} readOnly
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 bg-gray-50 focus:outline-none"/>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6">
            <label className="sm:w-28 flex-shrink-0 text-sm text-gray-600 font-medium">Mobile</label>
            <div
              className={`flex-1 relative flex items-center bg-white border rounded-lg transition-all ${
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
                    setCodeSearch("");
                  }}
                  className="flex items-center gap-1.5 pl-3 pr-2 py-2.5 text-sm text-gray-700 font-medium border-r border-gray-200 bg-gray-50 rounded-l-lg focus:outline-none"
                >
                  <span className="text-base">
                    {countries.find((c) => c.phoneCode === countryCode)?.flag ?? "🇦🇪"}
                  </span>
                  <span className="text-xs">{countryCode}</span>
                  <ChevronDown
                    className={`h-3 w-3 text-gray-400 transition-transform ${
                      codeOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {codeOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setCodeOpen(false)} />
                    <div className="absolute z-20 top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
                        <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <input
                          type="text"
                          placeholder="Search country..."
                          value={codeSearch}
                          onChange={(e) => setCodeSearch(e.target.value)}
                          className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                          autoFocus
                        />
                        {codeSearch && (
                          <button type="button" onClick={() => setCodeSearch("")} className="text-gray-400 hover:text-gray-600">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="max-h-56 overflow-y-auto py-1">
                        {filteredCountries.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">No results found</div>
                        ) : (
                          filteredCountries.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                onCountryCodeChange(c.phoneCode);
                                setCodeOpen(false);
                                setCodeSearch("");
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-orange-50 ${
                                c.phoneCode === countryCode ? "bg-orange-50 text-orange-600" : "text-gray-700"
                              }`}
                            >
                              <span>{c.flag}</span>
                              <span className="flex-1 truncate">{c.name}</span>
                              <span className="text-gray-400">{c.phoneCode}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                placeholder="500000000"
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  if (digits.length <= 15) onPhoneChange(digits);
                }}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                className="flex-1 px-3 py-2.5 text-sm text-gray-900 focus:outline-none bg-white min-w-0 rounded-r-lg"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6">
            <label className="sm:w-28 flex-shrink-0 text-sm text-gray-600 font-medium">Gender</label>
            <div className="flex-1">
              <SearchableSelect
                value={gender}
                onChange={onGenderChange}
                options={["Male", "Female", "Other"]}
                placeholder="Select gender..."
                searchPlaceholder="Search gender..."
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6">
            <label className="sm:w-28 flex-shrink-0 text-sm text-gray-600 font-medium">Date of Birth</label>
            <DobDatePicker value={dob} onChange={onDobChange} />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button type="submit" disabled={saving}
            className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 sm:px-8 py-2.5 rounded-lg text-sm transition-all disabled:opacity-60 flex items-center gap-2 w-full sm:w-auto justify-center">
            {saving
              ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving...</>
              : "Update Profile"
            }
          </button>
        </div>
      </form>
    </div>
  );
}