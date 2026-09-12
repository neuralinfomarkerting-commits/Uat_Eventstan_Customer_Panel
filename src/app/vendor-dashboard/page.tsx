"use client";
import { useState } from "react";
import { SERVICES, PACKAGES } from "@/lib/data";
import CurrencySymbol from "@/components/ui/CurrencySymbol";

const TABS = ["Overview", "Services", "Packages", "Bookings"];

export default function VendorDashboardPage() {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your services and bookings</p>
        </div>
        <button className="bg-orange-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-orange-600">
          + Add Service
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Active Services", value: SERVICES.length, icon: "🏪" },
              { label: "Packages", value: PACKAGES.length, icon: "📦" },
              { label: "Total Bookings", value: "24", icon: "📋" },
              { label: "Revenue", value: <><CurrencySymbol currency="AED" />48,200</>, icon: "💰" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-1">Welcome to your Vendor Portal</h3>
            <p className="text-sm text-gray-600">Manage your event services, create packages, and track bookings all in one place.</p>
          </div>
        </div>
      )}

      {activeTab === "Services" && (
        <div className="space-y-4">
          {SERVICES.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4">
              <img src={service.image_url} alt={service.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{service.title}</h3>
                    <p className="text-sm text-gray-500">{service.category} • {service.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">Edit</button>
                    <button className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50">Delete</button>
                  </div>
                </div>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  <span>⭐ {service.rating}</span>
                  <span><CurrencySymbol currency="AED" />{service.price_min.toLocaleString()} - <CurrencySymbol currency="AED" />{service.price_max.toLocaleString()}/{service.price_unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Packages" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-orange-600">
              + Add Package
            </button>
          </div>
          {PACKAGES.map((pkg) => {
            const service = SERVICES.find((s) => s.id === pkg.service_id);
            return (
              <div key={pkg.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{pkg.title}</h3>
                    <p className="text-sm text-gray-500">{service?.title} • <CurrencySymbol currency="AED" />{pkg.price.toLocaleString()} • Up to {pkg.max_guests} guests</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">Edit</button>
                    <button className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50">Delete</button>
                  </div>
                </div>
                {pkg.is_popular && <span className="mt-2 inline-block bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">Popular</span>}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "Bookings" && (
        <div className="space-y-4">
          {[
            { name: "Priya Sharma", event: "Wedding", date: "2024-06-15", service: "Grand Palace Ballroom", status: "confirmed", amount: 5500 },
            { name: "James Whitfield", event: "Corporate Gala", date: "2024-05-30", service: "Savory Bites Catering", status: "pending", amount: 3200 },
          ].map((b, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">{b.name}</h3>
                <p className="text-sm text-gray-500">{b.event} • {b.service} • {b.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-orange-500"><CurrencySymbol currency="AED" />{b.amount.toLocaleString()}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${b.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
