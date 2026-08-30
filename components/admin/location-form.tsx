"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveLocation } from "@/app/admin/stores/actions";
import { toast } from "@/components/ui/toaster";

export function LocationForm({
  initial,
}: {
  initial?: {
    id: string;
    name: string;
    slug: string;
    address: string | null;
    phone: string | null;
    active: boolean;
  };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [active, setActive] = useState(initial?.active ?? true);

  function submit() {
    start(async () => {
      const r = await saveLocation({
        id: initial?.id,
        name,
        slug,
        address,
        phone,
        active,
      });
      if (r.ok) {
        toast("Store saved", "success");
        router.push("/admin/stores");
        router.refresh();
      } else {
        toast(r.error, "error");
      }
    });
  }

  return (
    <form
      className="card max-w-xl space-y-4 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="loc-name">Store name</label>
          <input
            id="loc-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Khilgaon Outlet"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="loc-slug">Slug</label>
          <input
            id="loc-slug"
            className="input"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto from name"
          />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="loc-address">Address</label>
        <input
          id="loc-address"
          className="input"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="383/3/A Ekota Sarak, Khilgaon, Dhaka"
        />
      </div>
      <div>
        <label className="label" htmlFor="loc-phone">Phone</label>
        <input
          id="loc-phone"
          className="input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        Active (can record sales &amp; hold stock)
      </label>
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Save store"}
      </button>
    </form>
  );
}
