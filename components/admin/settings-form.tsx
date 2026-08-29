"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { saveSettings } from "@/app/admin/actions";
import { toast } from "@/components/ui/toaster";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { StoreSettings } from "@/lib/settings";

type State = { ok?: boolean; message?: string } | null;

export function SettingsForm({
  settings,
  collections,
}: {
  settings: StoreSettings;
  collections: { name: string; slug: string }[];
}) {
  const router = useRouter();
  const [state, action] = useActionState<State, FormData>(saveSettings, null);
  const [heroImages, setHeroImages] = useState<string[]>(settings.heroImages);

  useEffect(() => {
    if (state?.ok) {
      toast(state.message ?? "Saved", "success");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={action} className="max-w-2xl space-y-6">
      <fieldset className="card p-5">
        <legend className="label px-2">Mobile payment numbers</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">bKash number</label>
            <input
              name="bkash_number"
              defaultValue={settings.bkashNumber}
              className="input"
            />
          </div>
          <div>
            <label className="label">bKash account type</label>
            <input
              name="bkash_type"
              defaultValue={settings.bkashType}
              className="input"
              placeholder="Personal / Merchant"
            />
          </div>
          <div>
            <label className="label">Nagad number</label>
            <input
              name="nagad_number"
              defaultValue={settings.nagadNumber}
              className="input"
            />
          </div>
          <div>
            <label className="label">Nagad account type</label>
            <input
              name="nagad_type"
              defaultValue={settings.nagadType}
              className="input"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="card p-5">
        <legend className="label px-2">Shipping (৳)</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Inside Dhaka</label>
            <input
              name="shipping_inside_dhaka"
              type="number"
              defaultValue={settings.shippingInsideDhaka}
              className="input"
            />
          </div>
          <div>
            <label className="label">Outside Dhaka</label>
            <input
              name="shipping_outside_dhaka"
              type="number"
              defaultValue={settings.shippingOutsideDhaka}
              className="input"
            />
          </div>
          <div>
            <label className="label">Free shipping over</label>
            <input
              name="free_shipping_threshold"
              type="number"
              defaultValue={settings.freeShippingThreshold}
              className="input"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="card p-5">
        <legend className="label px-2">Announcement bar</legend>
        <textarea
          name="announcement"
          defaultValue={settings.announcement}
          className="textarea min-h-20"
          placeholder="Shown scrolling at the top of every page. Leave blank to hide."
        />
      </fieldset>

      <fieldset className="card space-y-4 p-5">
        <legend className="label px-2">Storefront — homepage</legend>

        <div>
          <label className="label">Hero headline</label>
          <textarea
            name="hero_headline"
            defaultValue={settings.heroHeadline}
            className="textarea min-h-16"
            placeholder={"Line one\nLine two"}
          />
          <p className="mt-1 text-xs text-muted-2">
            Line breaks show as separate lines. Big display type.
          </p>
        </div>

        <div>
          <label className="label">Hero subtext</label>
          <textarea
            name="hero_subtext"
            defaultValue={settings.heroSubtext}
            className="textarea min-h-20"
          />
        </div>

        <div>
          <ImageUploader
            label="Hero images"
            value={heroImages}
            onChange={setHeroImages}
            max={4}
            hint="Product / lookbook shots shown beside the headline on the default homepage. First image is the largest. Leave empty for the monogram panel."
          />
          <input
            type="hidden"
            name="hero_images"
            value={JSON.stringify(heroImages)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Primary button label</label>
            <input
              name="hero_cta_label"
              defaultValue={settings.heroCtaLabel}
              className="input"
            />
          </div>
          <div>
            <label className="label">Primary button link</label>
            <input
              name="hero_cta_href"
              defaultValue={settings.heroCtaHref}
              className="input"
              placeholder="/shop"
            />
          </div>
          <div>
            <label className="label">Secondary button label</label>
            <input
              name="hero_secondary_label"
              defaultValue={settings.heroSecondaryLabel}
              className="input"
              placeholder="(blank to hide)"
            />
          </div>
          <div>
            <label className="label">Secondary button link</label>
            <input
              name="hero_secondary_href"
              defaultValue={settings.heroSecondaryHref}
              className="input"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Featured collection on homepage</label>
            <select
              name="featured_collection"
              defaultValue={settings.featuredCollection}
              className="select"
            >
              <option value="">— none —</option>
              {collections.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              name="show_new_arrivals"
              value="true"
              defaultChecked={settings.showNewArrivals}
            />
            Show &ldquo;New arrivals&rdquo; section
          </label>
        </div>

        <div>
          <label className="label">Footer blurb</label>
          <textarea
            name="footer_blurb"
            defaultValue={settings.footerBlurb}
            className="textarea min-h-16"
            placeholder="Left blank = the default brand description."
          />
        </div>
      </fieldset>

      <button className="btn btn-primary">Save settings</button>
    </form>
  );
}
