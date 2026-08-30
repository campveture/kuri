"use client";

import { useState, useTransition } from "react";
import { createPage } from "@/app/admin/pages/actions";
import { toast } from "@/components/ui/toaster";
import { PAGE_TEMPLATES } from "@/lib/page-templates";
import { cn } from "@/lib/utils";

export function NewPageForm() {
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [templateKey, setTemplateKey] = useState("storefront");

  function submit() {
    start(async () => {
      const res = await createPage({ title, slug, templateKey });
      if (res && !res.ok) toast(res.error, "error");
      // success redirects server-side
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="np-title">Page title</label>
          <input
            id="np-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Eid Drop 2026"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="np-slug">URL slug</label>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-2">/</span>
            <input
              id="np-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="eid-drop"
              className="input"
            />
          </div>
        </div>
      </div>

      <div>
        <span className="label">Start from a template</span>
        <div className="grid gap-3 sm:grid-cols-2">
          {PAGE_TEMPLATES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTemplateKey(t.key)}
              className={cn(
                "border p-4 text-left transition-colors",
                templateKey === t.key
                  ? "border-gold-deep bg-cream-2"
                  : "border-line bg-white hover:border-charcoal/40",
              )}
            >
              <p className="h-display text-lg">{t.name}</p>
              <p className="mt-1 text-xs text-muted-2">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={submit}
        disabled={pending || !title.trim()}
        className={cn("btn btn-primary", (pending || !title.trim()) && "opacity-60")}
      >
        {pending ? "Creating…" : "Create page"}
      </button>
    </div>
  );
}
