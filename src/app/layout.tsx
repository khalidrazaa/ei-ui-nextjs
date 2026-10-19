import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";

import Container from "@/components/common/Container";
import AppFooter from "@/components/shell/AppFooter";
import AppHeader from "@/components/shell/AppHeader";
import ContactAttribution from "@/components/shell/ContactAttribution";
import MotionProvider from "@/components/motion/MotionProvider";
import MobileDock from "@/components/shell/MobileDock";
import { siteConfig } from "@/config/site";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

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

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body id="top" className="flex min-h-dvh flex-col">
        <MotionProvider>
        <ContactAttribution />
        <AppHeader />
        <Container as="main" className="flex-1 py-6 md:py-8">
          {children}
        </Container>
        <AppFooter />
        <MobileDock />
        </MotionProvider>
      </body>
    </html>
  );
}
