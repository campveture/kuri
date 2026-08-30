"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PurchaseOption = "one-time" | "subscribe";

export type CartLine = {
  productId: string;
  handle: string;
  name: string;
  size: string; // tea weight (50g / 100g / 250g)
  accent: string; // pouch colour
  purchaseOption: PurchaseOption;
  frequencyWeeks: number; // used when purchaseOption === "subscribe"
  unitPrice: number;
  quantity: number;
  maxStock: number;
};

export type AddItemArgs = {
  productId: string;
  handle: string;
  name: string;
  size: string;
  accent: string;
  purchaseOption: PurchaseOption;
  frequencyWeeks?: number;
  unitPrice: number;
  quantity: number;
  maxStock: number;
};

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (args: AddItemArgs) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  totalCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "kuri-cart-v2";

export function lineKey(l: {
  handle: string;
  size: string;
  purchaseOption: PurchaseOption;
}) {
  return `${l.handle}::${l.size}::${l.purchaseOption}`;
}

/** Per-line cap — matches `checkoutSchema` item quantity max. */
const MAX_QTY = 20;
const clampQty = (n: number, maxStock: number) =>
  Math.max(1, Math.min(n, maxStock, MAX_QTY));

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [ready, setReady] = useState(false);

  const load = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setLines(Array.isArray(parsed) ? parsed.filter(isLine) : []);
    } catch {
      setLines([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
     
    setReady(true);
    // keep two open tabs in sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [load]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, ready]);

  const addItem = useCallback((args: AddItemArgs) => {
    setLines((prev) => {
      const key = lineKey(args);
      const existing = prev.find((l) => lineKey(l) === key);
      if (existing) {
        return prev.map((l) =>
          lineKey(l) === key
            ? { ...l, quantity: clampQty(l.quantity + args.quantity, l.maxStock) }
            : l,
        );
      }
      return [
        ...prev,
        {
          productId: args.productId,
          handle: args.handle,
          name: args.name,
          size: args.size,
          accent: args.accent,
          purchaseOption: args.purchaseOption,
          frequencyWeeks: args.frequencyWeeks ?? 4,
          unitPrice: args.unitPrice,
          quantity: clampQty(args.quantity, args.maxStock),
          maxStock: args.maxStock,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => lineKey(l) !== key)
        : prev.map((l) =>
            lineKey(l) === key ? { ...l, quantity: clampQty(quantity, l.maxStock) } : l,
          ),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => lineKey(l) !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const totalCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines],
  );
  const totalPrice = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
    [lines],
  );

  const value: CartContextValue = {
    lines,
    ready,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem,
    updateQuantity,
    removeItem,
    clear,
    totalCount,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function isLine(x: unknown): x is CartLine {
  if (!x || typeof x !== "object") return false;
  const l = x as Record<string, unknown>;
  return (
    typeof l.productId === "string" &&
    typeof l.handle === "string" &&
    typeof l.name === "string" &&
    typeof l.size === "string" &&
    typeof l.accent === "string" &&
    (l.purchaseOption === "one-time" || l.purchaseOption === "subscribe") &&
    typeof l.frequencyWeeks === "number" &&
    Number.isFinite(l.unitPrice) &&
    Number.isFinite(l.quantity) &&
    (l.quantity as number) > 0 &&
    Number.isFinite(l.maxStock)
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
