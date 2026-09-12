"use client";

import { Address } from "./types";
import AddressCard from "./AddressCard";

interface AddressesTabProps {
  addresses: Address[];
  onAdd: () => void;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export default function AddressesTab({ addresses, onAdd, onEdit, onDelete, onSetDefault }: AddressesTabProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-4 sm:px-8 py-5 border-b border-gray-100 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">My Addresses</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage your saved delivery addresses</p>
        </div>
        <button onClick={onAdd}
          className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          <span className="hidden sm:inline">Add New Address</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="px-4 sm:px-8 py-6">
        {addresses.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <svg className="w-14 h-14 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <p className="font-medium text-gray-500">There is no address</p>
            <p className="text-sm mt-1 text-gray-400">This feature does not exist yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map(addr => (
              <AddressCard key={addr.addressId} address={addr} onEdit={onEdit} onDelete={onDelete} onSetDefault={onSetDefault} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
