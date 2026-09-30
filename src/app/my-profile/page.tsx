"use client";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { showSuccess } from "@/lib/toast";
import { AddressFormData, emptyAddressForm, Tab } from "@/components/profile/types";
import { customerApi, uploadImage } from "@/api/customerApi";
import type { Country, ApiAddress, AddressInput } from "@/api/customerApi";
import { useUaeLocations } from "@/lib/useUaeLocations";

function toUiAddress(a: ApiAddress, cityNameById: Map<string, string>): import("@/components/profile/types").Address {
  return {
    addressId: a.addressId,
    addressLine1: a.addressLine1,
    addressLine2: a.addressLine2 ?? "",
    landmark: a.landmark ?? "",
    poBoxNumber: a.poBoxNumber ?? "",
    state: "Dubai",
    city: (a.cityId && cityNameById.get(a.cityId)) || "",
    stateId: a.stateId ?? "",
    cityId: a.cityId ?? "",
    isDefault: a.isDefault,
  };
}

function toApiAddressInput(form: AddressFormData): AddressInput {
  return {
    addressLine1: form.addressLine1.trim(),
    addressLine2: form.addressLine2 || undefined,
    landmark: form.landmark || undefined,
    poBoxNumber: form.poBoxNumber || undefined,
    isDefault: form.isDefault,
    cityId: form.cityId || undefined,
    stateId: form.stateId || undefined,
  };
}

function ddmmyyyyToIso(value: string): string | undefined {
  const match = value.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return undefined;
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

function isoToDdmmyyyy(value?: string | null): string {
  if (!value) return "";
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "";
  const [, yyyy, mm, dd] = match;
  return `${dd}-${mm}-${yyyy}`;
}
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
  const { user, loading, logout, updateProfile, addAddress, updateAddress, deleteAddress } = useAuth();
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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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

  const { cities: uaeCities } = useUaeLocations();
  const cityNameById = new Map(uaeCities.map((c) => [c.id, c.name]));
  const addresses = (user?.addresses ?? []).map((a) => toUiAddress(a, cityNameById));
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
      if (user.firstName || user.lastName) {
        setFirstName(user.firstName ?? "");
        setLastName(user.lastName ?? "");
      } else {
        const parts = user.name.trim().split(" ");
        setFirstName(parts[0] ?? "");
        setLastName(parts.slice(1).join(" ") ?? "");
      }
      setEmail(user.email ?? "");
      setGender(user.gender ?? "");
      setDob(isoToDdmmyyyy(user.dateOfBirth));
      const rawPhone = user.phone ?? (user.countryCode ? `${user.countryCode}${user.mobile ?? ""}` : "");
      const { code, number } = splitPhone(rawPhone, countries);
      setCountryCode(user.countryCode || code);
      setPhone(user.mobile ?? number);
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
    const result = await updateProfile({
      name: fullName || user.name,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      phone: phone.trim() || undefined,
      countryCode: countryCode || undefined,
      gender: (gender as "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY") || undefined,
      dateOfBirth: ddmmyyyyToIso(dob),
    });

    setSaving(false);
    if (result.ok) {
      toast.success("Profile updated successfully!", { style: { borderRadius: "12px", fontWeight: "600" } });
    } else {
      toast.error(result.error || "Failed to update profile.");
    }
  };

  const handlePhotoSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }
    setUploadingPhoto(true);
    try {
      const uploaded = await uploadImage(file, "customers");
      const result = await updateProfile({ profileImage: uploaded.url });
      if (result.ok) {
        toast.success("Profile photo updated!");
      } else {
        toast.error(result.error || "Failed to save profile photo.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLogout = () => {    logout();
    setShowLogoutModal(false);
    showSuccess("Logged out successfully!");
    router.push("/");
  };

  const openAddAddress = () => {
    setEditingId(null);
    setAddressForm(emptyAddressForm);
    setShowAddressModal(true);
  };

  const openEditAddress = (address: (typeof addresses)[number]) => {
    setEditingId(address.addressId);
    setAddressForm({ ...address });
    setShowAddressModal(true);
  };

  const handleAddressFormChange = (field: keyof AddressFormData, value: string | boolean) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.addressLine1.trim()) {
      toast.error("Address Line 1 is required.");
      return;
    }
    setSavingAddress(true);
    const payload = toApiAddressInput(addressForm);
    const result = editingId ? await updateAddress(editingId, payload) : await addAddress(payload);
    setSavingAddress(false);
    if (result.ok) {
      toast.success(editingId ? "Address updated!" : "Address added!");
      setShowAddressModal(false);
      setEditingId(null);
      setAddressForm(emptyAddressForm);
    } else {
      toast.error(result.error || "Failed to save address.");
    }
  };

  const handleSetDefault = async (id: string) => {
    const target = addresses.find((a) => a.addressId === id);
    if (!target) return;
    const result = await updateAddress(id, { ...toApiAddressInput(target as unknown as AddressFormData), isDefault: true });
    if (result.ok) showSuccess("Default address updated!");
    else toast.error(result.error || "Failed to set default address.");
  };

  const handleDeleteAddress = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    const result = await deleteAddress(id);
    if (result.ok) showSuccess("Address removed.");
    else toast.error(result.error || "Failed to remove address.");
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
                  profileImage={user.profileImage} uploadingPhoto={uploadingPhoto} onPhotoSelect={handlePhotoSelect}
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