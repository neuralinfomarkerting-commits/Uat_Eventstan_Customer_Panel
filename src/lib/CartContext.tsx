"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Package, Service } from "@/types";
import {
  customerApi,
  CustomerCartItemResponse,
  findPriceUnitId,
  getPackages,
  getServices,
  PriceUnit,
} from "@/api/customerApi";
import { useAuth } from "@/lib/AuthContext";

const GUEST_CART_KEY = "es_guest_cart";
const GUEST_SHARE_ID_KEY = "es_guest_share_id";
const PKG_META_CACHE_KEY = "es_pkg_meta_cache";

type PkgMetaCache = Record<string, { pkg: Package; service?: Service }>;

function loadPkgMetaCache(): PkgMetaCache {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PKG_META_CACHE_KEY);
    return raw ? (JSON.parse(raw) as PkgMetaCache) : {};
  } catch {
    return {};
  }
}

function cachePkgMeta(packageId: string, pkg?: Package, service?: Service) {
  if (typeof window === "undefined" || !packageId || !pkg) return;
  try {
    const cache = loadPkgMetaCache();
    cache[packageId] = { pkg, service };
    localStorage.setItem(PKG_META_CACHE_KEY, JSON.stringify(cache));
  } catch {
  }
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  loading: boolean;
  shareId: string;
  addPackage: (
    pkg: Package,
    service?: Service,
    quantity?: number,
    days?: number,
    deliveryLocation?: string,
    transportFee?: number,
  ) => Promise<void>;
  addService: (service: Service) => void;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  updateItem: (id: string, quantity: number, days: number) => Promise<void>;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

function getGuestShareId(): string {
  if (typeof window === "undefined") return "guest";
  let id = window.localStorage.getItem(GUEST_SHARE_ID_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    window.localStorage.setItem(GUEST_SHARE_ID_KEY, id);
  }
  return id;
}

function resolveImage(...candidates: Array<string | undefined | null>): string {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  return "";
}

function serviceImage(service?: Service): string {
  return resolveImage(service?.image_url, service?.gallery?.[0]);
}

function toCartItem(
  row: CustomerCartItemResponse,
  fallback?: { service?: Service; pkg?: Package; image_url?: string }
): CartItem {
  const p = fallback?.pkg as any;
  return {
    id: row.cartItemId,
    cartItemId: row.cartItemId,
    type: "package",
    title: p?.title || p?.name || "Package",
    subtitle: fallback?.service
      ? [fallback.service.vendor_name, fallback.service.category].filter(Boolean).join(" · ")
      : "",
    price: row.totalAmount,
    quantity: row.quantity,
    unitQuantity: row.quantity,
    days: row.days,
    transportFee: row.transportFee ?? undefined,
    image_url: resolveImage(fallback?.image_url, serviceImage(fallback?.service)),
    pkg: fallback?.pkg,
    service: fallback?.service,
  };
}

function loadGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
  }
}

function clearGuestCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_CART_KEY);
}
let priceUnitsCache: Promise<PriceUnit[]> | null = null;
function getCachedPriceUnits(): Promise<PriceUnit[]> {
  if (!priceUnitsCache) {
    priceUnitsCache = customerApi.masterData.getPriceUnits().catch((error) => {
      priceUnitsCache = null;
      throw error;
    });
  }
  return priceUnitsCache;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareId, setShareId] = useState("guest");

  useEffect(() => {
    setShareId(user ? `u${user.id}` : getGuestShareId());
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `shared-cart:${shareId}`;
    const existingRaw = window.localStorage.getItem(key);
    if (!existingRaw) return;
    try {
      const existing = JSON.parse(existingRaw);
      const payload = {
        name: existing.name ?? "",
        email: existing.email ?? "",
        note: existing.note ?? "",
        items: items.map((i) => ({
          id: i.id,
          title: i.title,
          price: i.price,
          type: i.type,
          image_url: i.image_url,
        })),
        total: items.reduce((sum, i) => sum + i.price, 0),
      };
      window.localStorage.setItem(key, JSON.stringify(payload));
    } catch {
    }
  }, [items, shareId]);

  useEffect(() => {
    if (user) return;
    setItems(loadGuestCart());
  }, [user]);

  useEffect(() => {
    if (user) return;
    saveGuestCart(items);
  }, [items, user]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    (async () => {
      setLoading(true);
      const guestItems = loadGuestCart();
      const guestPackages = guestItems.filter((i) => i.type === "package" && i.pkg);
      const guestServices = guestItems.filter((i) => i.type === "service" && i.service);

      const priceUnits = await getCachedPriceUnits().catch(() => [] as PriceUnit[]);
      for (const item of guestPackages) {
        try {
          const p = item.pkg as any;
          const priceUnitId = findPriceUnitId(priceUnits, p.price_unit ?? p.priceUnit);
          if (!priceUnitId) throw new Error(`No matching price unit for package ${p.id}`);
          cachePkgMeta(p.id, item.pkg, item.service);
          await customerApi.cart.add({
            userId: user.id,
            packageId: p.id,
            quantity: item.unitQuantity || item.quantity || 1,
            days: item.days || 1,
            priceUnitId,
            transportFee: item.transportFee || 0,
          });
        } catch (error) {
          console.error("Failed to sync guest cart item:", error);
        }
      }

      clearGuestCart();

      try {
        const res = await customerApi.cart.get(user.id);
        if (!active) return;
        let imageByPackageId = new Map<string, string>();
        let packageById = new Map<string, Package>();
        let serviceByPackageId = new Map<string, Service>();
        try {
          const [packages, services] = await Promise.all([getPackages(), getServices()]);
          const serviceById = new Map(services.map((s) => [s.id, s]));
          const imageByServiceId = new Map(services.map((s) => [s.id, serviceImage(s)]));
          packageById = new Map(packages.map((p) => [p.id, p]));
          serviceByPackageId = new Map(
            packages
              .map((p) => [p.id, serviceById.get(p.service_id)] as [string, Service | undefined])
              .filter((entry): entry is [string, Service] => !!entry[1])
          );
          imageByPackageId = new Map(
            packages.map((p) => {
              const pAny = p as any;
              return [
                p.id,
                resolveImage(pAny.image_url, pAny.imageUrl, pAny.image, imageByServiceId.get(p.service_id), pAny.gallery?.[0], pAny.items?.[0]?.service?.imageUrl, pAny.items?.[0]?.service?.image_url),
              ];
            })
          );
        } catch (error) {
          console.error("Failed to load images for cart items:", error);
        }

        const pkgMetaCache = loadPkgMetaCache();
        const serverItems = res.data.items.map((row) => {
          const cached = pkgMetaCache[row.packageId];
          const pkg = packageById.get(row.packageId) ?? cached?.pkg;
          const service = serviceByPackageId.get(row.packageId) ?? cached?.service;
          cachePkgMeta(row.packageId, pkg, service);
          return toCartItem(row, {
            image_url: imageByPackageId.get(row.packageId),
            pkg,
            service,
          });
        });
        setItems([...serverItems, ...guestServices]);
      } catch {
        if (active) setItems(guestServices);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user]);

  const addPackage = async (
    pkg: Package,
    service?: Service,
    quantity: number = 1,
    days: number = 1,
    deliveryLocation?: string,
    transportFee: number = 0,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = pkg as any;
    const billableQuantity = quantity * days;

    if (!user) {
      cachePkgMeta(p.id, pkg, service);
      setItems((prev) => {
        const exists = prev.find((i) => i.id === `pkg-${pkg.id}`);
        if (exists) return prev;
        const newItem: CartItem = {
          id: `pkg-${pkg.id}`,
          type: "package",
          title: p.title || p.name || "Package",
          subtitle: service ? [service.vendor_name, service.category].filter(Boolean).join(" · ") : "Package",
          price: (p.price ?? 0) * billableQuantity + transportFee,
          quantity: billableQuantity,
          unitQuantity: quantity,
          days,
          deliveryLocation,
          transportFee: transportFee || undefined,
          image_url: resolveImage(p.image_url, p.imageUrl, p.image, serviceImage(service), p.gallery?.[0], p.items?.[0]?.service?.imageUrl, p.items?.[0]?.service?.image_url),
          pkg,
          service,
        };
        return [...prev, newItem];
      });
      setIsOpen(true);
      return;
    }

    try {
      setLoading(true);
      const priceUnits = await getCachedPriceUnits();
      const priceUnitId = findPriceUnitId(priceUnits, p.price_unit ?? p.priceUnit);
      if (!priceUnitId) {
        throw new Error(`No matching price unit for package ${p.id} (${p.price_unit ?? p.priceUnit})`);
      }
      const res = await customerApi.cart.add({
        userId: user.id,
        packageId: p.id,
        quantity,
        days,
        priceUnitId,
        transportFee: transportFee || 0,
      });
      const row = res.data;
      cachePkgMeta(p.id, pkg, service);
      setItems((prev) => {
        const withoutExisting = prev.filter((i) => i.cartItemId !== row.cartItemId);
        return [
          ...withoutExisting,
          {
            ...toCartItem(row, { service, pkg, image_url: resolveImage(p.image_url, p.imageUrl, p.image, serviceImage(service), p.gallery?.[0], p.items?.[0]?.service?.imageUrl, p.items?.[0]?.service?.image_url) }),
            deliveryLocation,
          },
        ];
      });
      setIsOpen(true);
    } catch (error) {
      console.error("Failed to add package to cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addService = (service: Service) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === `svc-${service.id}`);
      if (exists) return prev;
      const newItem: CartItem = {
        id: `svc-${service.id}`,
        type: "service",
        title: service.title,
        subtitle: `${service.category} • ${service.location}`,
        price: service.price_min,
        image_url: serviceImage(service),
        service,
      };
      return [...prev, newItem];
    });
    setIsOpen(true);
  };

  const removeItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));

    if (item?.cartItemId && user) {
      try {
        await customerApi.cart.remove(item.cartItemId, user.id);
      } catch (error) {
        console.error("Failed to remove cart item:", error);
      }
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    const item = items.find((i) => i.id === id);
    if (quantity < 1) return;

    if (!user || !item?.cartItemId) {
      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;
          const p = i.pkg as any;
          const unitPrice = p?.price ?? 0;
          const days = i.days || 1;
          const fee = i.transportFee || 0;
          return {
            ...i,
            quantity: quantity * days,
            unitQuantity: quantity,
            price: unitPrice * quantity * days + fee,
          };
        })
      );
      return;
    }

    try {
      const res = await customerApi.cart.update(item.cartItemId, { userId: user.id, quantity });
      const row = res.data;
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, price: row.totalAmount, quantity: row.quantity } : i))
      );
    } catch (error) {
      console.error("Failed to update cart item:", error);
    }
  };
  const updateItem = async (id: string, quantity: number, days: number) => {
    const item = items.find((i) => i.id === id);
    if (quantity < 1 || days < 1) return;

    if (!user || !item?.cartItemId) {
      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;
          const p = i.pkg as any;
          const unitPrice = p?.price ?? 0;
          const fee = i.transportFee || 0;
          return {
            ...i,
            quantity: quantity * days,
            unitQuantity: quantity,
            days,
            price: unitPrice * quantity * days + fee,
          };
        })
      );
      return;
    }

    try {
      const res = await customerApi.cart.update(item.cartItemId, { userId: user.id, quantity, days });
      const row = res.data;
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, price: row.totalAmount, quantity: row.quantity, unitQuantity: row.quantity, days: row.days }
            : i
        )
      );
    } catch (error) {
      try {
        const res = await customerApi.cart.update(item.cartItemId, { userId: user.id, quantity });
        const row = res.data;
        const p = item.pkg as any;
        const unitPrice = p?.price ?? (row.totalAmount / (item.unitQuantity || quantity || 1) / (item.days || 1));
        const fee = item.transportFee || 0;
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? { ...i, price: unitPrice * quantity * days + fee, quantity: row.quantity, unitQuantity: row.quantity, days }
              : i
          )
        );
      } catch (fallbackError) {
        console.error("Failed to update cart item:", fallbackError);
      }
    }
  };
  const clearCart = () => {
    setItems([]);
    if (!user) clearGuestCart();
  };
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((o) => !o);

  const total = items.reduce((sum, i) => sum + i.price, 0);
  const count = items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        loading,
        shareId,
        addPackage,
        addService,
        removeItem,
        updateQuantity,
        updateItem,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}