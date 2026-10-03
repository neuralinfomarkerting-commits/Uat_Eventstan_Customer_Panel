"use client";

import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

interface CountryOption {
  id: string | number;
  name: string;
  flag?: string;
  phoneCode?: string | null;
}

interface CountryCodeSelectProps {
  value: string;
  onChange: (phoneCode: string) => void;
  countries: CountryOption[];
  buttonClassName?: string;
  disabled?: boolean;
}
export default function CountryCodeSelect({
  value,
  onChange,
  countries,
  buttonClassName = "pl-3.5 pr-2 py-3",
  disabled = false,
}: CountryCodeSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Some countries have no dial code in the master data — skip them.
  const usable = countries.filter((c) => !!c.phoneCode);

  const q = search.trim().toLowerCase();
  const qDigits = q.replace(/[^\d]/g, "");
  // "+91" / "91" -> match dial codes that START with those digits (so India
  // shows up, not +591 / +691). Text -> match the country name.
  const isCodeQuery = /^\+?\d+$/.test(q);

  const rank = (c: CountryOption) => {
    const dial = (c.phoneCode ?? "").replace("+", "");
    const name = (c.name ?? "").toLowerCase();
    if (isCodeQuery) return dial === qDigits ? 0 : 1;
    if (name.startsWith(q)) return 0;
    if (name.split(/[\s(]+/).some((w) => w.startsWith(q))) return 1;
    return 2;
  };

  const filtered = usable
    .filter((c) => {
      if (!q) return true;
      const dial = (c.phoneCode ?? "").replace("+", "");
      if (isCodeQuery) return dial.startsWith(qDigits);
      return (c.name ?? "").toLowerCase().includes(q);
    })
    .sort((a, b) => (q ? rank(a) - rank(b) : 0));

  const close = () => {
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
          setSearch("");
        }}
        className={`flex items-center gap-1 ${buttonClassName} text-sm text-gray-700 font-medium border-r border-gray-200 focus:outline-none disabled:opacity-60`}
      >
        <span>{countries.find((c) => c.phoneCode === value)?.flag ?? "🌐"}</span>
        <span>{value}</span>
        <ChevronDown
          className={`h-3 w-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={close} />
          <div className="absolute z-20 top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No results found
                </div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onChange(c.phoneCode as string);
                      close();
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-orange-50 ${
                      c.phoneCode === value ? "bg-orange-50 text-orange-600" : "text-gray-700"
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
  );
}
