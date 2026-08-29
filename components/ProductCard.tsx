import Link from "next/link";
import type { ProductCard as ProductCardData } from "@/lib/queries";
import { PouchIllustration } from "@/components/PouchIllustration";
import { formatBDT } from "@/lib/utils";

export function ProductCard({
  product,
  imageBg = "bg-cream-2",
}: {
  product: ProductCardData;
  imageBg?: string;
}) {
  return (
    <Link href={`/shop/${product.slug}`} className="group flex flex-col gap-5">
      <div
        className={`flex aspect-[1/1.15] items-center justify-center rounded-sm p-6 ${imageBg}`}
      >
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full rounded-sm object-cover"
          />
        ) : (
          <PouchIllustration
            color={product.accent}
            colorDark={product.accentDark}
            className="h-[90%] w-[62%]"
          />
        )}
      </div>
      <div>
        <div className="font-serif text-[17px] font-semibold">{product.name}</div>
        <div className="my-3 flex flex-wrap gap-1.5">
          {product.tastingNotes.map((note) => (
            <span
              key={note}
              className="chip transition-colors group-hover:border-green group-hover:text-green"
            >
              {note}
            </span>
          ))}
        </div>
        <div className="text-sm font-semibold">
          {product.inStock ? `From ${formatBDT(product.price)}` : "Sold out"}
        </div>
      </div>
    </Link>
  );
}
