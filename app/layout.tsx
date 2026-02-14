import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { ThemeProvider } from "next-themes";
import { Providers } from "@/components/providers";
import "./globals.css";

const spaceMono = localFont({
  src: [
    {
      path: "./fonts/SpaceMono-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/SpaceMono-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-space-mono",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_URL ||
  "https://bookmark-app-atlas.vercel.app/";

const resolvedSiteUrl = siteUrl.startsWith("http")
  ? siteUrl
  : `https://${siteUrl}`;


export const metadata: Metadata = {
  metadataBase: new URL(resolvedSiteUrl),
  title: {
    default: "Dev Atlas | Your Bookmarks, Perfectly Organized",
    template: "%s | Dev Atlas",
  },
  description:
    "Save, organize, and access your bookmarks from anywhere. Built for people who collect resources and need them to be findable.",
  keywords: [
    "bookmark manager",
    "digital library",
    "link organizer",
    "resource management",
    "bookmark app",
    "save links",
    "organize bookmarks",
  ],
  authors: [{ name: "Devloop", url: "https://www.devloop.software" }],
  creator: "Devloop",
  publisher: "Devloop",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: resolvedSiteUrl,
    siteName: "Dev Atlas",
    title: "Dev Atlas | Your Digital Library, Perfectly Organized",
    description:
      "Save, organize, and access your bookmarks from anywhere. Built for people who collect resources and need them to be findable.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Dev Atlas - Your Digital Library, Perfectly Organized",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dev Atlas | Your Digital Library, Perfectly Organized",
    description:
      "Save, organize, and access your bookmarks from anywhere. Built for people who collect resources and need them to be findable.",
    images: ["/twitter-image.png"],
    creator: "@devloopsoftware",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "miOqBmpipmC70cGV-if3V9wfkEgXIPLIg_cGpXmNu7E",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${spaceMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <body
        suppressHydrationWarning
        className={`${spaceMono.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
        <Script
          src="/metrics/lib.js"
          data-website-id="ad6711d2-6b18-43d7-ac62-37945bb36c6c"
          data-host-url="/metrics"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
