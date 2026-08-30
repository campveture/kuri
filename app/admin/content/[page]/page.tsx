import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PAGE_LABELS,
  getPageContent,
  isPageKey,
} from "@/lib/content";
import { ContentForm } from "@/components/admin/content-form";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Edit page content" };

export default async function EditPageContentPage(
  props: PageProps<"/admin/content/[page]">,
) {
  await requireAdmin();
  const { page } = await props.params;
  if (!isPageKey(page)) notFound();

  const content = await getPageContent(page);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/content"
          className="text-xs uppercase tracking-[0.12em] text-muted-2 hover:text-gold-deep"
        >
          ← Page content
        </Link>
        <h1 className="h-display mt-1 text-3xl">{PAGE_LABELS[page]}</h1>
      </div>
      <ContentForm page={page} initial={content} />
    </div>
  );
}
