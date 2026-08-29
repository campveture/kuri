import Link from "next/link";
import { SITE } from "@/lib/site";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-charcoal lg:block">
        <div className="hairline-grid absolute inset-0" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-cream">
          <Link href="/" className="font-serif text-2xl">
            Kuri
          </Link>
          <div>
            <p className="h-display text-5xl text-cream">
              One garden.
              <br />
              One team.
              <br />
              <span className="text-gold">No blending.</span>
            </p>
            <p className="mt-6 max-w-sm text-sm text-[color:rgba(247,242,230,0.7)]">
              {SITE.description}
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:rgba(247,242,230,0.55)]">
            {SITE.address}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-16 sm:px-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 block font-serif text-xl lg:hidden">
            Kuri
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
