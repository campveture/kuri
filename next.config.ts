import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photos, journal covers and page-content images are supplied by the
    // admin as URLs (pasted, or from the upload route → Vercel Blob / Neon S3).
    // Allow any https host; SVGs stay disabled (the default) so this isn't an XSS vector.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
