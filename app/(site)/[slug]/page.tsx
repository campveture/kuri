import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/queries";
import { RESERVED_SLUGS } from "@/lib/blocks";
import { BlockRenderer } from "@/components/blocks/block-renderer";

export async function generateMetadata(props: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  if (RESERVED_SLUGS.has(slug)) return {};
  const page = await getPageBySlug(slug);
  if (!page) return {};
  return {
    title: page.seoTitle || `${page.title} — Kuri`,
    description: page.seoDescription || undefined,
  };
}

export default async function LandingPage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  if (RESERVED_SLUGS.has(slug)) notFound();

  const page = await getPageBySlug(slug);
  if (!page || page.parsedBlocks.length === 0) notFound();

  return <BlockRenderer blocks={page.parsedBlocks} />;
}
