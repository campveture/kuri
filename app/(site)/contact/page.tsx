import type { Metadata } from "next";
import Image from "next/image";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact — Kuri",
  description: "Get in touch with Kuri Valley Estate.",
};

export default function ContactPage() {
  return (
    <div className="wrap py-16 sm:py-20 md:py-24">
      <div className="mb-16 max-w-[560px]">
        <div className="eyebrow mb-4">Contact</div>
        <h1 className="font-serif text-[32px] font-medium sm:text-4xl md:text-[42px]">Get in touch</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-charcoal-2">
          Questions about an order, wholesale, press, or anything else -- send us a note.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-16 md:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="relative mb-10 aspect-[4/3] overflow-hidden rounded-sm bg-cream-2">
            <Image
              src="/images/portrait.jpg"
              alt="A path between tea garden rows in Sreemangal, Bangladesh"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-6 text-sm">
            <div>
              <div className="spec-label">Email</div>
              <div>[EMAIL]</div>
            </div>
            <div>
              <div className="spec-label">Phone</div>
              <div>[PHONE]</div>
            </div>
            <div>
              <div className="spec-label">Estate Address</div>
              <div>Kuri Valley Estate, Sreemangal, Sylhet, Bangladesh [FULL ADDRESS]</div>
            </div>
          </div>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
