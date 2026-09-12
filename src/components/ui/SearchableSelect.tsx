"use client";

import { useState } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  error?: boolean;
  disabled?: boolean;
  searchPlaceholder?: string;
}

// Same searchable-dropdown UX used on the Contact page (search box + list +
// checkmark on the selected option), pulled out here so it can be reused
// anywhere a searchable select is needed (e.g. the address form's City field).
export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  error = false,
  disabled = false,
  searchPlaceholder = "Search...",
}: SearchableSelectProps) {
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
    `w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors bg-white ${
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
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 w-full mt-2 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder={searchPlaceholder}
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
}
