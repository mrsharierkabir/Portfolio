import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";
import { getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = `${s.name} — ${s.role}`;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: `%s · ${s.name}` },
    description: s.seoDescription,
    applicationName: s.name,
    authors: [{ name: s.name, url: s.github }],
    keywords: ["Full-stack developer", "React", "Next.js", "Supabase", "Flutter", "Python", "Dhaka", "Bangladesh", "Portfolio", s.name],
    openGraph: { type: "website", title, description: s.seoDescription, siteName: s.name, url: "/" },
    twitter: { card: "summary_large_image", title, description: s.seoDescription },
    alternates: { canonical: "/" },
  };
}

export const viewport: Viewport = { themeColor: "#f5f3ef", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
