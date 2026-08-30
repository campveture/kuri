import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseBlocks } from "@/lib/blocks";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Landing pages" };

export default async function AdminPagesPage() {
  await requireAdmin();
  const pages = await prisma.page.findMany({
    orderBy: [{ isHome: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h-display text-3xl">Pages</h1>
          <p className="mt-1 text-sm text-muted-2">
            Build the homepage and standalone landing pages from ready-made
            sections. Landing pages go live at <code>/your-slug</code>.
          </p>
        </div>
        <Link href="/admin/pages/new" className="btn btn-primary btn-sm">
          + New page
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">URL</th>
              <th className="p-3 text-left">Sections</th>
              <th className="p-3 text-left">State</th>
              <th className="p-3 text-left">Updated</th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-muted-2">No pages yet.</td></tr>
            )}
            {pages.map((p) => {
              const count = parseBlocks(p.blocks).length;
              return (
                <tr key={p.id} className="border-t border-line">
                  <td className="p-3">
                    <Link
                      href={`/admin/pages/${p.id}`}
                      className="font-medium hover:text-gold-deep"
                    >
                      {p.title}
                      {p.isHome && <span className="badge ml-2">Home</span>}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-2">
                    <Link
                      href={p.isHome ? "/" : `/${p.slug}`}
                      target="_blank"
                      className="hover:text-gold-deep"
                    >
                      {p.isHome ? "/" : `/${p.slug}`} ↗
                    </Link>
                  </td>
                  <td className="p-3 text-muted-2">
                    {count === 0
                      ? p.isHome
                        ? "default layout"
                        : "0"
                      : count}
                  </td>
                  <td className="p-3">
                    <span
                      className="badge"
                      style={
                        p.status === "PUBLISHED"
                          ? {
                              background: "#e6efe7",
                              color: "#2c4030",
                              borderColor: "#c2d8c6",
                            }
                          : undefined
                      }
                    >
                      {p.status === "PUBLISHED" ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td className="p-3 text-muted-2">
                    {new Date(p.updatedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
