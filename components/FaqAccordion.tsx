"use client";

import { useState } from "react";

type FaqItem = { question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.question} className="border-b border-line">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className={`pr-6 text-[15px] font-semibold ${isOpen ? "text-green" : ""}`}>
                {item.question}
              </span>
              <span className={`shrink-0 text-xl leading-none ${isOpen ? "text-green" : "text-muted-2"}`}>
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <p className="pb-5 pr-10 text-[14px] leading-relaxed text-muted">{item.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
