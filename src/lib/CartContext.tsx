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

// The server cart only stores a packageId — full pkg/service objects (price,
// price_unit, min/max, delivery info, images…) are needed for the "Configure
// & Update Cart" edit modal, so they're normally re-matched from a fresh
// packages/services fetch on load. That fetch can be slow, fail, or (rarely)
// not contain a package that's since been unpublished, which used to make
// the edit pencil silently disappear after a refresh. This cache remembers
// the last-known pkg/service for every packageId the shopper has touched,
// so the edit modal still has what it needs even if that fetch comes up
// empty.
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
    // ignore quota/serialization errors — worst case the edit modal falls
    // back to whatever the packages/services fetch returns
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // ignore quota/serialization errors — cart just won't persist
  }
}

function clearGuestCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_CART_KEY);
}

// Price units rarely change, so fetch once per session and reuse — every
// addPackage call needs to resolve a package's priceUnit label (e.g. "per
// event") to the matching PriceUnitMaster id the backend expects.
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

  // A stable id for this account (or this browser, if not logged in) that
  // the "Share Cart" link is built around — so the same link keeps working
  // and updating even as the cart's own contents change.
  useEffect(() => {
    setShareId(user ? `u${user.id}` : getGuestShareId());
  }, [user]);

  // If a share link has already been generated (a shared-cart:{shareId}
  // entry exists in localStorage), keep its items/total in sync with the
  // live cart on every add/remove — so the same link a person already
  // shared reflects the current cart without them having to regenerate it.
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
      // corrupt/unreadable entry — leave it alone rather than throw
    }
  }, [items, shareId]);

  // Logged-out visitors: load whatever's in localStorage on first mount.
  useEffect(() => {
    if (user) return;
    setItems(loadGuestCart());
  }, [user]);

  // Whenever the guest cart changes, persist it — so it survives a refresh.
  useEffect(() => {
    if (user) return;
    saveGuestCart(items);
  }, [items, user]);

  // On login: push any locally-saved packages into the real backend cart,
  // then load the merged server cart. Service-only entries (which the
  // backend has no concept of) are re-added on top so nothing is lost.
  useEffect(() => {
    if (!user) return;
    let active = true;

    (async () => {
      setLoading(true);
      const guestItems = loadGuestCart();
      const guestPackages = guestItems.filter((i) => i.type === "package" && i.pkg);
      const guestServices = guestItems.filter((i) => i.type === "service" && i.service);

      // Sync each locally-added package to the backend cart.
      const priceUnits = await getCachedPriceUnits().catch(() => [] as PriceUnit[]);
      for (const item of guestPackages) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        // The cart endpoint doesn't return images, so look them up via the
        // packages/services list (packageId -> service_id -> image_url).
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const pAny = p as any;
              return [
                p.id,
                resolveImage(pAny.image_url, pAny.image, imageByServiceId.get(p.service_id), pAny.gallery?.[0]),
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
          // Refresh the cache from whichever source won, so it stays
          // current for next time (e.g. once the live fetch succeeds again).
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
    // The backend (and the rest of the cart) only understands a single
    // "quantity" multiplier, so a rental of e.g. 5 units for 3 days is
    // billed as quantity 15 (5 × 3). We still remember the raw unit
    // count and day count on the item so the UI can show "5 × 3 days".
    // Transport fee (rental delivery) is billed on top and isn't part of
    // the backend's per-unit price, so it's tracked separately and added
    // to the item's displayed price.
    const billableQuantity = quantity * days;

    if (!user) {
      // Guest cart: saved to localStorage only, synced to the backend
      // automatically the moment they log in.
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
          image_url: resolveImage(p.image_url, p.image, serviceImage(service), p.gallery?.[0]),
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
      // row.totalAmount already includes the transport fee — the backend
      // adds it server-side — so it isn't added again here.
      setItems((prev) => {
        const withoutExisting = prev.filter((i) => i.cartItemId !== row.cartItemId);
        return [
          ...withoutExisting,
          {
            ...toCartItem(row, { service, pkg, image_url: resolveImage(p.image_url, p.image, serviceImage(service), p.gallery?.[0]) }),
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
      // Guest (or local-only) item — just update it in place.
      // `quantity` here is the raw unit count (e.g. "how many chairs"),
      // not the billable quantity (unitCount × days) stored on the item,
      // so unitPrice/days/transportFee must be recombined explicitly —
      // dividing item.price by item.quantity silently drops the days
      // multiplier and the transport fee, undercharging on every edit.
      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Used by the "Configure & Update Cart" modal (the edit version of the
  // add-to-cart modal), which lets the shopper change both the unit
  // quantity ("how many chairs") and the number of days/hours/persons in
  // one go, instead of only the single quantity updateQuantity handles.
  const updateItem = async (id: string, quantity: number, days: number) => {
    const item = items.find((i) => i.id === id);
    if (quantity < 1 || days < 1) return;

    if (!user || !item?.cartItemId) {
      // Guest (or local-only) item — recompute price from the package's
      // unit price directly, same reasoning as updateQuantity above.
      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // The API may still be running an older build that doesn't know the
      // "days" field yet (its DTO validation rejects unknown properties
      // outright), which would otherwise make every edit silently fail.
      // Fall back to a quantity-only update against that endpoint, and
      // keep the new day count correct locally by recomputing the price
      // ourselves instead of trusting the server's (days-unaware) total.
      try {
        const res = await customerApi.cart.update(item.cartItemId, { userId: user.id, quantity });
        const row = res.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Backend already deletes cart items as part of checkout, so this just
  // resets local UI state.
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