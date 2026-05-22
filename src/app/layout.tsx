import type { Metadata } from "next";

import AppHeader from "@/components/shell/AppHeader";
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
      <body>
        <div className="bg-orb bg-orb-one" aria-hidden />
        <div className="bg-orb bg-orb-two" aria-hidden />
        <AppHeader />
        <main className="app-shell app-main">{children}</main>
        <MobileDock />
      </body>
    </html>
  );
}
