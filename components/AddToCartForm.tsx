"use client";

import { useMemo, useState } from "react";
import { useCart, type PurchaseOption } from "@/components/CartContext";
import { formatBDT } from "@/lib/utils";

export type AddToCartProduct = {
  id: string;
  handle: string;
  name: string;
  price: number;
  subscribePrice: number | null;
  accent: string;
  variants: { size: string; stock: number }[];
};

const FREQUENCIES = [
  { weeks: 4, label: "Every 4 weeks" },
  { weeks: 6, label: "Every 6 weeks" },
  { weeks: 8, label: "Every 8 weeks" },
];

export function AddToCartForm({ product }: { product: AddToCartProduct }) {
  const { addItem } = useCart();
  const firstInStock = useMemo(
    () => product.variants.find((v) => v.stock > 0) ?? product.variants[0],
    [product.variants],
  );
  const [size, setSize] = useState(firstInStock?.size ?? "");
  const [option, setOption] = useState<PurchaseOption>("one-time");
  const [frequency, setFrequency] = useState(4);
  const [quantity, setQuantity] = useState(1);

  const variant = product.variants.find((v) => v.size === size);
  const canSubscribe = product.subscribePrice != null;
  const unitPrice =
    option === "subscribe" && product.subscribePrice != null
      ? product.subscribePrice
      : product.price;
  const outOfStock = !variant || variant.stock <= 0;

  return (
    <div>
      <div className="mb-6 text-[22px] font-semibold">{formatBDT(unitPrice)}</div>

      {/* Weight */}
      <div className="mb-6">
        <div className="spec-label">Weight</div>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((v) => {
            const disabled = v.stock <= 0;
            return (
              <button
                key={v.size}
                type="button"
                disabled={disabled}
                onClick={() => setSize(v.size)}
                className={`border px-4 py-2 text-sm font-semibold transition-colors ${
                  size === v.size
                    ? "border-charcoal bg-charcoal text-cream"
                    : "border-line text-charcoal hover:border-charcoal"
                } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
              >
                {v.size}
                {disabled ? " · sold out" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Purchase option */}
      {canSubscribe && (
        <div className="mb-6 border border-line">
          <button
            type="button"
            onClick={() => setOption("one-time")}
            className="flex w-full items-center gap-3 border-b border-line px-[18px] py-4 text-left"
          >
            <Dot on={option === "one-time"} />
            <span className="flex-1 text-sm font-semibold">One-time purchase</span>
            <span className="text-sm font-semibold">{formatBDT(product.price)}</span>
          </button>
          <button
            type="button"
            onClick={() => setOption("subscribe")}
            className="flex w-full items-center gap-3 px-[18px] py-4 text-left"
          >
            <Dot on={option === "subscribe"} />
            <span className="flex-1">
              <span className="block text-sm font-semibold">Subscribe &amp; save</span>
              <span className="mt-0.5 block text-xs text-muted-2">
                Delivered on your schedule, cancel anytime
              </span>
            </span>
            <span className="text-sm font-semibold">
              {formatBDT(product.subscribePrice!)}
            </span>
          </button>
          {option === "subscribe" && (
            <div className="border-t border-line px-[18px] py-3">
              <select
                className="select text-sm"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.weeks} value={f.weeks}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

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
            onClick={() =>
              setQuantity((q) => Math.min(variant?.stock ?? 1, q + 1))
            }
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button
          type="button"
          disabled={outOfStock}
          className="btn btn-primary flex-1 disabled:opacity-40"
          onClick={() => {
            if (!variant) return;
            addItem({
              productId: product.id,
              handle: product.handle,
              name: product.name,
              size: variant.size,
              accent: product.accent,
              purchaseOption: option,
              frequencyWeeks: frequency,
              unitPrice,
              quantity,
              maxStock: variant.stock,
            });
          }}
        >
          {outOfStock ? "Sold out" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

function Dot({ on }: { on: boolean }) {
  return (
    <span
      className={`h-4 w-4 rounded-full border ${
        on ? "border-[5px] border-charcoal" : "border-[1.5px] border-muted-2"
      }`}
    />
  );
}
