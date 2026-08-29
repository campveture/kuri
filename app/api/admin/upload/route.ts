import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { randomToken } from "@/lib/utils";

const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Raster formats only. SVG is deliberately NOT allowed — it can carry <script> and,
 * served from our own origin, that's a stored XSS.
 */
const TYPES: { mime: string; ext: string; sniff: (b: Buffer) => boolean }[] = [
  {
    mime: "image/jpeg",
    ext: "jpg",
    sniff: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: "image/png",
    ext: "png",
    sniff: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    mime: "image/webp",
    ext: "webp",
    sniff: (b) =>
      b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP",
  },
  {
    mime: "image/avif",
    ext: "avif",
    sniff: (b) => b.toString("ascii", 4, 12) === "ftypavif",
  },
];

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Max 4MB" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  // Trust the file contents, not the client-supplied MIME type.
  const match = TYPES.find((t) => t.sniff(buffer));
  if (!match) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, WEBP or AVIF image" },
      { status: 415 },
    );
  }

  const key = `products/up-${Date.now()}-${randomToken(8)}.${match.ext}`;

  try {
    const url = await store(key, buffer, match.mime);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("upload failed", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 },
    );
  }
}

/** Neon Object Storage → Vercel Blob → local disk, whichever is configured. */
async function store(key: string, body: Buffer, contentType: string): Promise<string> {
  // 1. Neon Object Storage (S3-compatible, public_read bucket)
  if (process.env.AWS_ENDPOINT_URL_S3 && process.env.AWS_ACCESS_KEY_ID) {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const bucket = process.env.NEON_UPLOADS_BUCKET || "uploads";
    const s3 = new S3Client({ forcePathStyle: true }); // Neon requires path-style
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    const endpoint = process.env.AWS_ENDPOINT_URL_S3.replace(/\/$/, "");
    return `${endpoint}/${bucket}/${key}`;
  }

  // 2. Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(key, body, {
      access: "public",
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  // 3. Local disk (dev only) — serverless filesystems are read-only
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    throw new Error(
      "No upload backend configured. Add a Vercel Blob store (Storage → Create → Blob) " +
        "or a Neon Object Storage bucket, then redeploy. You can also paste an image URL " +
        "in the product form.",
    );
  }
  const { writeFile, mkdir } = await import("node:fs/promises");
  const { join, dirname } = await import("node:path");
  const rel = key.replace(/^products\//, "");
  const dest = join(process.cwd(), "public", "uploads", rel);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, body);
  return `/uploads/${rel}`;
}
