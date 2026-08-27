"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { CloseIcon } from "@/components/Icons";

function formatBDT(amount: number) {
  return `৳${amount.toLocaleString("en-US")}`;
}

export function CartDrawer() {
  const { lines, isOpen, closeCart, updateQuantity, removeItem, totalPrice } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[rgba(43,36,28,0.4)] transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col bg-cream shadow-2xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-line px-7 py-6">
          <h2 className="font-serif text-xl font-medium">Your Cart</h2>
          <button type="button" onClick={closeCart} aria-label="Close cart">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6">
          {lines.length === 0 ? (
            <p className="text-sm text-muted-2">Your cart is empty.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {lines.map((line) => (
                <div key={`${line.handle}-${line.purchaseOption}`} className="flex gap-4">
                  <div
                    className="h-16 w-16 shrink-0 rounded-sm"
                    style={{ backgroundColor: line.color }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{line.name}</div>
                    <div className="mt-1 text-xs text-muted-2">
                      {line.purchaseOption === "subscribe" ? "Subscribe & save" : "One-time purchase"}
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center border border-[rgba(43,36,28,0.3)] text-xs">
                        <button
                          type="button"
                          className="px-2 py-1"
                          onClick={() =>
                            updateQuantity(line.handle, line.purchaseOption, line.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                        >
                          &minus;
                        </button>
                        <span className="px-2 py-1 font-medium">{line.quantity}</span>
                        <button
                          type="button"
                          className="px-2 py-1"
                          onClick={() =>
                            updateQuantity(line.handle, line.purchaseOption, line.quantity + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-muted-2 underline"
                        onClick={() => removeItem(line.handle, line.purchaseOption)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatBDT(line.unitPrice * line.quantity)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-line px-7 py-6">
          <div className="mb-4 flex items-center justify-between text-sm font-semibold">
            <span>Subtotal</span>
            <span>{formatBDT(totalPrice)}</span>
          </div>
          <button
            type="button"
            disabled={lines.length === 0}
            className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40"
          >
            Checkout
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-2">
            Checkout isn&apos;t wired up yet -- this site isn&apos;t connected to a payment
            processor.
          </p>
          <Link
            href="/shop"
            onClick={closeCart}
            className="mt-4 block text-center text-xs font-semibold underline"
          >
            Continue shopping
          </Link>
        </div>
      </aside>
    </>
  );
}
