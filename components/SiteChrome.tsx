import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function SiteChrome({
  children,
  announcement,
}: {
  children: React.ReactNode;
  announcement?: string;
}) {
  const hasBar = Boolean(announcement && announcement.trim());
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-40">
        {hasBar && (
          <div className="bg-charcoal py-2.5 text-center text-[11px] tracking-wide text-cream sm:text-xs">
            {announcement}
          </div>
        )}
        <Nav />
      </div>
      {/* spacer: nav height, plus the announcement bar only when it's shown */}
      <div className={hasBar ? "h-[calc(38px+60px)] md:h-[calc(38px+72px)]" : "h-[60px] md:h-[72px]"} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
