import type { Metadata } from "next";
import { photoCredits } from "@/lib/photoCredits";

export const metadata: Metadata = {
  title: "Photo Credits — Kuri",
  description: "Attribution for photography used on this site.",
};

export default function PhotoCreditsPage() {
  return (
    <div className="wrap py-16 md:py-20">
      <div className="mb-12 max-w-[640px]">
        <div className="eyebrow mb-3.5">Photo Credits</div>
        <h1 className="font-serif text-3xl font-medium md:text-[38px]">Photography</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-charcoal-2">
          Kuri Valley Estate hasn&apos;t had its own photoshoot yet, so this site currently
          uses real, freely-licensed photographs of Sreemangal&apos;s tea gardens from
          Wikimedia Commons rather than stock imagery of other regions. None of these are
          photos of Kuri Valley Estate specifically. Every image below is credited to its
          photographer as required by its license.
        </p>
      </div>
      <div className="flex flex-col divide-y divide-line border-t border-b border-line">
        {photoCredits.map((credit) => (
          <div key={credit.file} className="flex flex-col gap-1 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold">{credit.title}</div>
              <div className="mt-1 text-xs text-muted-2">
                Photo by {credit.photographer}, licensed{" "}
                <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  {credit.license}
                </a>
              </div>
            </div>
            <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold underline">
              View source on Wikimedia Commons
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
