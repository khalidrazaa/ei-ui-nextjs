import type { Metadata } from "next";

import AppFooter from "@/components/shell/AppFooter";
import AppHeader from "@/components/shell/AppHeader";
import ContactAttribution from "@/components/shell/ContactAttribution";
import MobileDock from "@/components/shell/MobileDock";
import { siteConfig } from "@/config/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${siteConfig.domain}`),
  title: {
    default: siteConfig.brandName,
    template: `%s | ${siteConfig.brandName}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="app-body">
        <ContactAttribution />
        <div className="bg-orb bg-orb-one" aria-hidden />
        <div className="bg-orb bg-orb-two" aria-hidden />
        <AppHeader />
        <main className="app-shell app-main">{children}</main>
        <AppFooter />
        <MobileDock />
      </body>
    </html>
  );
}
