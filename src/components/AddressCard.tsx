import { Address } from "./profile/types";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  return (
    <div
      className={`relative border rounded-xl p-4 sm:p-5 transition-all
        ${address.isDefault ? "border-orange-300 bg-orange-50/40" : "border-gray-200 bg-white hover:border-gray-300"}`}
    >
      {address.isDefault && (
        <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
          Default
        </span>
      )}

      <div className="flex items-start gap-3 pr-16">
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4.5 h-4.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{address.addressLine1}</p>
          {address.addressLine2 && <p className="text-sm text-gray-600">{address.addressLine2}</p>}
          {(address.city || address.state) && (
            <p className="text-sm text-gray-600">
              {[address.city, address.state].filter(Boolean).join(", ")}
            </p>
          )}
          {address.landmark && <p className="text-xs text-gray-400 mt-1">Landmark: {address.landmark}</p>}
          {address.poBoxNumber && <p className="text-xs text-gray-400">P.O. Box: {address.poBoxNumber}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        <button onClick={() => onEdit(address)} className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          Edit
        </button>
        <span className="text-gray-200">|</span>
        <button onClick={() => onDelete(address.addressId)} className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Delete
        </button>
        {!address.isDefault && (
          <button onClick={() => onSetDefault(address.addressId)} className="ml-auto text-xs font-semibold text-orange-500 hover:text-orange-600">
            Set as Default
          </button>
        )}
      </div>
    </div>
  );
}
