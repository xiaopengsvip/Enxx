import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import "./globals.css";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalApplication",
  name: siteConfig.name,
  alternateName: siteConfig.cnName,
  applicationCategory: "EducationApplication",
  operatingSystem: "Web",
  description: siteConfig.description,
  url: siteConfig.domain,
  creator: {
    "@type": "Person",
    name: siteConfig.developerName,
    url: siteConfig.developerSite,
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain),
  title: siteConfig.fullName,
  description: siteConfig.description,
  applicationName: siteConfig.name,
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: siteConfig.fullName,
    description: siteConfig.slogan,
    url: siteConfig.domain,
    siteName: siteConfig.name,
    images: [{ url: "/brand-poster.png", width: 1200, height: 630, alt: siteConfig.fullName }],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.fullName,
    description: siteConfig.slogan,
    images: ["/brand-poster.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#38bdf8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
