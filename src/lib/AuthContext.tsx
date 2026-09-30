"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  customerApi,
  unwrap,
  type ApiProfile,
  type ApiAddress,
  type AddressInput,
  type AuthResponse,
  type UpdateProfileInput,
} from "@/api/customerApi";

export interface AuthUser extends ApiProfile {
  avatar: string;
  type: "individual" | "corporate";
  joinedAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; name?: string }>;
  signup: (name: string, email: string, phone: string, password: string, type: "individual" | "corporate") => Promise<{ ok: boolean; error?: string; welcomeEmailSent?: boolean }>;
  logout: () => void;
  updateProfile: (updates: UpdateProfileInput) => Promise<{ ok: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  addAddress: (input: AddressInput) => Promise<{ ok: boolean; error?: string; address?: ApiAddress }>;
  updateAddress: (addressId: string, input: AddressInput) => Promise<{ ok: boolean; error?: string }>;
  deleteAddress: (addressId: string) => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function initials(name: string) {
  return (
    (name || "")
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

function normalizeUser(profile: ApiProfile, type: "individual" | "corporate" = "individual", joinedAt?: string): AuthUser {
  return {
    ...profile,
    avatar: initials(profile.name),
    type,
    joinedAt: joinedAt ?? new Date().toISOString().slice(0, 10),
  };
}

// Only one address can be default; mirror that locally when a new one is marked default.
function applyDefault(list: ApiAddress[], next: ApiAddress): ApiAddress[] {
  const withoutNext = list.filter((a) => a.addressId !== next.addressId);
  const shouldBeDefault = next.isDefault || withoutNext.length === 0;
  const normalized = shouldBeDefault ? withoutNext.map((a) => ({ ...a, isDefault: false })) : withoutNext;
  return [...normalized, { ...next, isDefault: shouldBeDefault }];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (fallbackType: "individual" | "corporate" = "individual", joinedAt?: string) => {
    const profile = await customerApi.auth.me();
    if (profile.role !== "CUSTOMER") throw new Error("Customer account required");
    const normalized = normalizeUser(profile, fallbackType, joinedAt);
    setUser(normalized);
    localStorage.setItem("es_user", JSON.stringify(normalized));
    return normalized;
  };

  useEffect(() => {
    const stored = localStorage.getItem("es_user");
    const authToken = localStorage.getItem("es_token");
    if (!stored || !authToken) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    const current = JSON.parse(stored) as AuthUser;
    loadProfile(current.type, current.joinedAt)
      .catch(() => {
        localStorage.removeItem("es_token");
        localStorage.removeItem("es_user");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSession = (response: AuthResponse, type: "individual" | "corporate" = "individual") => {
    localStorage.setItem("es_token", response.accessToken);
    const normalized = normalizeUser(response.user as ApiProfile, type);
    localStorage.setItem("es_user", JSON.stringify(normalized));
    setUser(normalized);
    return normalized;
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await customerApi.auth.login(email, password);
      if (response.user.role !== "CUSTOMER") return { ok: false, error: "Please use the correct portal for this account." };
      saveSession(response);
      // Pull the full profile (addresses, gender, dob, etc.) right after login.
      await loadProfile().catch(() => undefined);
      return { ok: true, name: response.user.name };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Login failed." };
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string, type: "individual" | "corporate") => {
    try {
      const response = await customerApi.auth.register(name, email, phone, password);
      saveSession(response, type);
      await loadProfile(type).catch(() => undefined);
      return { ok: true, welcomeEmailSent: response.welcomeEmailSent };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Sign up failed." };
    }
  };

  const logout = () => {
    // The live API has no /auth/logout endpoint — this is purely client-side.
    setUser(null);
    localStorage.removeItem("es_token");
    localStorage.removeItem("es_user");
  };

  const updateProfile = async (updates: UpdateProfileInput) => {
    try {
      const account = await customerApi.auth.updateMe(updates);
      setUser((prev) => {
        if (!prev) return prev;
        const updated = normalizeUser({ ...prev, ...account }, prev.type, prev.joinedAt);
        localStorage.setItem("es_user", JSON.stringify(updated));
        return updated;
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Failed to update profile." };
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    await loadProfile(user.type, user.joinedAt).catch(() => undefined);
  };

  const addAddress = async (input: AddressInput) => {
    try {
      const created = unwrap(await customerApi.addresses.add(input));
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, addresses: applyDefault(prev.addresses ?? [], created) };
        localStorage.setItem("es_user", JSON.stringify(updated));
        return updated;
      });
      return { ok: true, address: created };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Failed to add address." };
    }
  };

  const updateAddress = async (addressId: string, input: AddressInput) => {
    try {
      const updatedAddress = unwrap(await customerApi.addresses.update(addressId, input));
      setUser((prev) => {
        if (!prev) return prev;
        const existing = prev.addresses ?? [];
        const replaced = existing.map((a) => (a.addressId === addressId ? updatedAddress : a));
        const nextAddresses = updatedAddress.isDefault ? applyDefault(replaced, updatedAddress) : replaced;
        const updated = { ...prev, addresses: nextAddresses };
        localStorage.setItem("es_user", JSON.stringify(updated));
        return updated;
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Failed to update address." };
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      await customerApi.addresses.remove(addressId);
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, addresses: (prev.addresses ?? []).filter((a) => a.addressId !== addressId) };
        localStorage.setItem("es_user", JSON.stringify(updated));
        return updated;
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Failed to delete address." };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, updateProfile, refreshUser, addAddress, updateAddress, deleteAddress }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
