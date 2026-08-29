import type { Metadata } from "next";
import Image from "next/image";
import { ContactForm } from "@/components/ContactForm";
import { getPageContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact — Kuri",
  description: "Get in touch with Kuri Valley Estate.",
};

export default async function ContactPage() {
  const c = await getPageContent("contact");

  return (
    <div className="wrap py-16 sm:py-20 md:py-24">
      <div className="mb-16 max-w-[560px]">
        <div className="eyebrow mb-4">{c.hero.eyebrow}</div>
        <h1 className="font-serif text-[32px] font-medium sm:text-4xl md:text-[42px]">{c.hero.headline}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-charcoal-2">
          {c.hero.body}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-16 md:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="relative mb-10 aspect-[4/3] overflow-hidden rounded-sm bg-cream-2">
            <Image
              src={c.image.src}
              alt={c.image.alt}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-6 text-sm">
            <div>
              <div className="spec-label">{c.details.emailLabel}</div>
              <div>{c.details.email}</div>
            </div>
            <div>
              <div className="spec-label">{c.details.phoneLabel}</div>
              <div>{c.details.phone}</div>
            </div>
            <div>
              <div className="spec-label">{c.details.addressLabel}</div>
              <div>{c.details.address}</div>
            </div>
          </div>
        </div>
        <ContactForm contactEmail={c.details.email} />
      </div>
    </div>
  );
}
