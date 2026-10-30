import SmoothScroll from "@/components/site/SmoothScroll";
import Nav from "@/components/site/Nav";
import Cursor from "@/components/site/Cursor";
import Footer from "@/components/site/Footer";
import { getSettings } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <SmoothScroll>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">Skip to content</a>
      <Nav initials={s.initials} available={s.available} />
      <Cursor />
      <main id="main">{children}</main>
      <Footer s={s} />
    </SmoothScroll>
  );
}
