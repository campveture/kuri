import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllJournalPosts, getJournalPostBySlug } from "@/lib/journal";

export function generateStaticParams() {
  return getAllJournalPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getJournalPostBySlug(slug);
  if (!post) return {};
  return { title: `${post.title} — Kuri Journal`, description: post.excerpt };
}

export default async function JournalPostPage(props: PageProps<"/journal/[slug]">) {
  const { slug } = await props.params;
  const post = getJournalPostBySlug(slug);
  if (!post) notFound();

  return (
    <div>
      <div className="wrap pt-6 text-xs text-muted-2">
        <Link href="/">Home</Link>&nbsp;/&nbsp;<Link href="/journal">Journal</Link>&nbsp;/&nbsp;
        {post.title}
      </div>

      <div className="wrap py-12 md:py-16">
        <div className="mx-auto max-w-[720px]">
          <div className="eyebrow mb-4">{post.category}</div>
          <h1 className="font-serif text-3xl font-medium leading-tight md:text-[42px]">
            {post.title}
          </h1>
          <div className="mt-4 text-xs text-muted-2">{post.date}</div>
        </div>
      </div>

      <div className="wrap mb-16">
        <div className="relative mx-auto aspect-[16/7] max-w-[900px] overflow-hidden rounded-sm">
          <Image
            src={`/images/${post.image}`}
            alt={post.imageAlt}
            fill
            sizes="(min-width: 900px) 900px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="wrap pb-28">
        <div className="mx-auto flex max-w-[720px] flex-col gap-6 text-[16px] leading-relaxed text-charcoal-2">
          {post.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        <div className="mx-auto mt-16 max-w-[720px] border-t border-line pt-8">
          <Link href="/journal" className="text-sm font-semibold underline">
            &larr; Back to Journal
          </Link>
        </div>
      </div>
    </div>
  );
}
