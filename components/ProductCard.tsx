import Link from "next/link";
import type { Product } from "@/lib/commerce";
import { PouchIllustration } from "@/components/PouchIllustration";

export function ProductCard({
  product,
  imageBg = "bg-cream-2",
}: {
  product: Product;
  imageBg?: string;
}) {
  return (
    <Link href={`/shop/${product.handle}`} className="group flex flex-col gap-5">
      <div className={`flex aspect-[1/1.15] items-center justify-center rounded-sm p-6 ${imageBg}`}>
        <PouchIllustration
          color={product.color}
          colorDark={product.colorDark}
          className="h-[90%] w-[62%]"
        />
      </div>
      <div>
        <div className="font-serif text-[17px] font-semibold">{product.name}</div>
        <div className="my-3 flex gap-1.5">
          {product.tastingNotes.map((note) => (
            <span
              key={note}
              className="chip transition-colors group-hover:border-green group-hover:text-green"
            >
              {note}
            </span>
          ))}
        </div>
        <div className="text-sm font-semibold">From ৳{product.price}</div>
      </div>
    </Link>
  );
}
