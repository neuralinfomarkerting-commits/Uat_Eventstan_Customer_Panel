"use client";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { showSuccess } from "@/lib/toast";
import { Address, AddressFormData, emptyAddressForm, Tab } from "@/components/profile/types";
import { customerApi } from "@/api/customerApi";
import type { Country } from "@/api/customerApi";
import Sidebar from "@/components/profile/Sidebar";
import PersonalInfoTab from "@/components/profile/PersonalInfoTab";
import AddressesTab from "@/components/profile/AddressesTab";
import AddressModal from "@/components/profile/AddressModal";
import ConfirmModal from "@/components/profile/ConfirmModal";
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

export default function ProfilePage() {
  const { user, loading, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("personal");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [saving, setSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [countries, setCountries] = useState<Country[]>([]);
  const [countryCode, setCountryCode] = useState("+971");

  useEffect(() => {
    let cancelled = false;
    customerApi.masterData.getCountries().then((list) => {
      if (!cancelled && list.length > 0) setCountries(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormData>(emptyAddressForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const parts = user.name.trim().split(" ");
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" ") ?? "");
      setEmail(user.email ?? "");
      const rawPhone = user.phone ?? "";
      const { code, number } = splitPhone(rawPhone, countries);
      setCountryCode(code);
      setPhone(number);
    }
  }, [user, countries]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <svg className="w-8 h-8 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    );
  }

  const avatarColor = ["bg-orange-500","bg-blue-500","bg-green-500","bg-purple-500","bg-pink-500"][user.name.charCodeAt(0) % 5];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    const fullPhone = phone.trim() ? `${countryCode}${phone.trim()}` : "";
    const result = await updateProfile({ name: fullName || user.name, phone: fullPhone || undefined });

    setSaving(false);
    if (result.ok) {
      toast.success("Profile updated successfully!", { style: { borderRadius: "12px", fontWeight: "600" } });
      if (gender || dob) {
        toast.error("Gender and Date of Birth do not exist in the system yet.", { duration: 4000 });
      }
    } else {
      toast.error(result.error || "Failed to update profile.");
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    showSuccess("Logged out successfully!");
    router.push("/");
  };

  const openAddAddress = () => {
    toast.error("This feature is not available yet.");
  };

  const openEditAddress = () => {
    toast.error("This feature is not available yet.");
  };

  const handleAddressFormChange = (field: keyof AddressFormData, value: string | boolean) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.error("This feature is not available yet.");
  };

  const handleSetDefault = () => {
    toast.error("This feature is not available yet.");
  };

  const handleDeleteAddress = () => {
    toast.error("This feature is not available yet.");
    setDeleteId(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4 md:hidden">
            <button onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              Menu
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${avatarColor} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                {user.avatar}
              </div>
              <span className="font-semibold text-gray-900 text-sm">{user.name}</span>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <aside className="hidden md:block w-56 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
              <Sidebar user={user} avatarColor={avatarColor} tab={tab}
                onTabChange={t => { setTab(t); setSidebarOpen(false); }}
                onLogoutClick={() => { setSidebarOpen(false); setShowLogoutModal(true); }} />
            </aside>

            <div className="flex-1 min-w-0">
              {tab === "personal" && (
                <PersonalInfoTab
                  user={user} avatarColor={avatarColor}
                  firstName={firstName} lastName={lastName} email={email} phone={phone} gender={gender} dob={dob}
                  saving={saving}
                  countryCode={countryCode} countries={countries}
                  onFirstNameChange={setFirstName} onLastNameChange={setLastName}
                  onPhoneChange={setPhone} onCountryCodeChange={setCountryCode}
                  onGenderChange={setGender} onDobChange={setDob}
                  onSubmit={handleSave}
                />
              )}

              {tab === "addresses" && (
                <AddressesTab
                  addresses={addresses}
                  onAdd={openAddAddress}
                  onEdit={openEditAddress}
                  onDelete={setDeleteId}
                  onSetDefault={handleSetDefault}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-2xl md:hidden overflow-y-auto">
            <div className="flex justify-end p-4">
              <button onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <Sidebar user={user} avatarColor={avatarColor} tab={tab}
              onTabChange={t => { setTab(t); setSidebarOpen(false); }}
              onLogoutClick={() => { setSidebarOpen(false); setShowLogoutModal(true); }} />
          </div>
        </>
      )}

      {showAddressModal && (
        <AddressModal
          isEditing={!!editingId}
          form={addressForm}
          saving={savingAddress}
          onChange={handleAddressFormChange}
          onSubmit={handleSaveAddress}
          onClose={() => setShowAddressModal(false)}
        />
      )}

      {deleteId && (
        <ConfirmModal
          title="Remove this address?"
          message="This action cannot be undone."
          confirmLabel="Yes, Remove"
          onConfirm={handleDeleteAddress}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {showLogoutModal && (
        <ConfirmModal
          title="Logout?"
          message="Are you sure you want to logout from your account?"
          confirmLabel="Yes, Logout"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
}