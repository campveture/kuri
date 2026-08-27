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
import type { Product, PurchaseOption } from "@/lib/commerce";

export type CartLine = {
  handle: string;
  name: string;
  color: string;
  purchaseOption: PurchaseOption;
  unitPrice: number;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity: number, purchaseOption: PurchaseOption) => void;
  updateQuantity: (handle: string, purchaseOption: PurchaseOption, quantity: number) => void;
  removeItem: (handle: string, purchaseOption: PurchaseOption) => void;
  totalCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "kuri-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore malformed/unavailable storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore unavailable storage
    }
  }, [lines, hydrated]);

  const addItem = useCallback(
    (product: Product, quantity: number, purchaseOption: PurchaseOption) => {
      setLines((prev) => {
        const unitPrice = purchaseOption === "subscribe" ? product.subscribePrice : product.price;
        const existing = prev.find(
          (l) => l.handle === product.handle && l.purchaseOption === purchaseOption
        );
        if (existing) {
          return prev.map((l) =>
            l === existing ? { ...l, quantity: l.quantity + quantity } : l
          );
        }
        return [
          ...prev,
          {
            handle: product.handle,
            name: product.name,
            color: product.color,
            purchaseOption,
            unitPrice,
            quantity,
          },
        ];
      });
      setIsOpen(true);
    },
    []
  );

  const updateQuantity = useCallback(
    (handle: string, purchaseOption: PurchaseOption, quantity: number) => {
      setLines((prev) =>
        quantity <= 0
          ? prev.filter((l) => !(l.handle === handle && l.purchaseOption === purchaseOption))
          : prev.map((l) =>
              l.handle === handle && l.purchaseOption === purchaseOption
                ? { ...l, quantity }
                : l
            )
      );
    },
    []
  );

  const removeItem = useCallback((handle: string, purchaseOption: PurchaseOption) => {
    setLines((prev) =>
      prev.filter((l) => !(l.handle === handle && l.purchaseOption === purchaseOption))
    );
  }, []);

  const totalCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);
  const totalPrice = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
    [lines]
  );

  const value: CartContextValue = {
    lines,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem,
    updateQuantity,
    removeItem,
    totalCount,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
