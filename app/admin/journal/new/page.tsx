import Link from "next/link";
import { PostForm } from "@/components/admin/post-form";

export const metadata = { title: "New journal entry" };

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/journal"
        className="text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep"
      >
        ← Journal
      </Link>
      <h1 className="h-display text-3xl">New journal entry</h1>
      <PostForm />
    </div>
  );
}
