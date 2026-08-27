"use client";

import { useState } from "react";
import type { Product, PurchaseOption } from "@/lib/commerce";
import { useCart } from "@/components/CartContext";

function formatBDT(amount: number) {
  return `৳${amount.toLocaleString("en-US")}`;
}

export function AddToCartForm({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const [purchaseOption, setPurchaseOption] = useState<PurchaseOption>("one-time");
  const [quantity, setQuantity] = useState(1);

  const activePrice = purchaseOption === "subscribe" ? product.subscribePrice : product.price;

  return (
    <div>
      <div className="mb-6 text-[22px] font-semibold">{formatBDT(activePrice)}</div>

      <div className="mb-6 border border-line">
        <button
          type="button"
          onClick={() => setPurchaseOption("one-time")}
          className="flex w-full items-center gap-3 border-b border-line px-[18px] py-4 text-left"
        >
          <span
            className={`h-4 w-4 rounded-full border ${
              purchaseOption === "one-time" ? "border-[5px] border-charcoal" : "border-[1.5px] border-muted-2"
            }`}
          />
          <span className="flex-1 text-sm font-semibold">One-time purchase</span>
          <span className="text-sm font-semibold">{formatBDT(product.price)}</span>
        </button>
        <button
          type="button"
          onClick={() => setPurchaseOption("subscribe")}
          className="flex w-full items-center gap-3 px-[18px] py-4 text-left"
        >
          <span
            className={`h-4 w-4 rounded-full border ${
              purchaseOption === "subscribe" ? "border-[5px] border-charcoal" : "border-[1.5px] border-muted-2"
            }`}
          />
          <span className="flex-1">
            <span className="block text-sm font-semibold">Subscribe &amp; save 10%</span>
            <span className="mt-0.5 block text-xs text-muted-2">
              Delivered every [4 weeks], cancel anytime
            </span>
          </span>
          <span className="text-sm font-semibold">{formatBDT(product.subscribePrice)}</span>
        </button>
      </div>

      <div className="flex gap-3.5">
        <div className="flex items-center border border-charcoal">
          <button
            type="button"
            className="px-4 py-3.5"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            &minus;
          </button>
          <span className="px-2.5 py-3.5 text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            className="px-4 py-3.5"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button
          type="button"
          className="btn btn-primary flex-1"
          onClick={() => {
            addItem(product, quantity, purchaseOption);
            openCart();
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
