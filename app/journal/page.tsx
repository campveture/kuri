import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllJournalPosts } from "@/lib/journal";

export const metadata: Metadata = {
  title: "Journal — Kuri",
  description: "Notes on brewing, origin, and how Kuri tea is made.",
};

export default function JournalPage() {
  const posts = getAllJournalPosts();

  return (
    <div className="wrap py-20 md:py-24">
      <div className="mb-16 max-w-[560px]">
        <div className="eyebrow mb-4">Journal</div>
        <h1 className="font-serif text-4xl font-medium md:text-[42px]">Notes from the valley</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-charcoal-2">
          Brewing guides, origin notes, and the occasional dispatch from Sreemangal.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/journal/${post.slug}`} className="group flex flex-col gap-5">
            <div className="relative aspect-[16/10] overflow-hidden rounded-sm">
              <Image
                src={`/images/${post.image}`}
                alt={post.imageAlt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <div>
              <div className="eyebrow mb-2">{post.category}</div>
              <div className="font-serif text-lg font-medium leading-snug transition-colors group-hover:text-green">
                {post.title}
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{post.excerpt}</p>
              <div className="mt-3 text-xs text-muted-2">{post.date}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
