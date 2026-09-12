"use client";

import { AddressFormData } from "./types";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { useUaeLocations } from "@/lib/useUaeLocations";

interface AddressModalProps {
  isEditing: boolean;
  form: AddressFormData;
  saving: boolean;
  onChange: (field: keyof AddressFormData, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function AddressModal({ isEditing, form, saving, onChange, onSubmit, onClose }: AddressModalProps) {
  const { stateName, cities, loading: locationsLoading } = useUaeLocations();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{isEditing ? "Edit Address" : "Add New Address"}</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Address Line 1 *</label>
            <input
              type="text"
              value={form.addressLine1}
              onChange={e => onChange("addressLine1", e.target.value)}
              placeholder="Apartment / Building"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Address Line 2</label>
            <input
              type="text"
              value={form.addressLine2}
              onChange={e => onChange("addressLine2", e.target.value)}
              placeholder="Area / Locality"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">State *</label>
              {/* Platform currently only operates in Dubai, so this is fixed —
                  the name still comes from the live /master-data/states API. */}
              <input
                type="text"
                value={form.state || stateName}
                disabled
                readOnly
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">City *</label>
              <SearchableSelect
                value={form.city}
                onChange={(value) => onChange("city", value)}
                options={cities}
                placeholder={locationsLoading ? "Loading cities..." : "Select city..."}
                searchPlaceholder="Search city..."
                disabled={locationsLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Landmark</label>
            <input
              type="text"
              value={form.landmark}
              onChange={e => onChange("landmark", e.target.value)}
              placeholder="Near..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">P.O. Box Number</label>
            <input
              type="text"
              value={form.poBoxNumber}
              onChange={e => onChange("poBoxNumber", e.target.value)}
              placeholder="12345"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={e => onChange("isDefault", e.target.checked)}
              className="w-4 h-4 accent-orange-500 rounded"
            />
            <span className="text-sm text-gray-700">Set as default address</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {saving
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving...</>
                : isEditing ? "Save Changes" : "Add Address"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
