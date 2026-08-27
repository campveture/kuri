import type { ImageLoaderProps } from "next/image";

// next/image with `unoptimized` does not apply `basePath`, which breaks
// images on GitHub Pages (site served under /kuri). This loader prefixes
// the base path build-time via NEXT_PUBLIC_BASE_PATH (set in next.config.ts).
export default function imageLoader({ src }: ImageLoaderProps) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (src.startsWith("http")) return src;
  return `${basePath}${src}`;
}
