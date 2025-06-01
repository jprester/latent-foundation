import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Latent Foundation",
    template: "%s | Latent Foundation",
  },
  description:
    "A collection of SCP-inspired short stories written with the help of AI. Secure, Contain, Protect, Generate.",
  keywords: [
    "SCP",
    "horror fiction",
    "AI generated stories",
    "science fiction",
    "anomalous objects",
    "foundation",
    "secure contain protect",
  ],
  authors: [{ name: "Latent Foundation" }],
  creator: "Latent Foundation",
  publisher: "Latent Foundation",
  metadataBase: new URL("https://https://latent-foundation.vercel.app/"), // Replace with your actual domain
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Latent Foundation",
    description:
      "A collection of SCP-inspired short stories written with the help of AI. Secure, Contain, Protect, Generate.",
    siteName: "Latent Foundation",
    images: [
      {
        url: "/images/og-default.svg", // Using SVG for now, replace with PNG later
        width: 1200,
        height: 630,
        alt: "Latent Foundation - SCP Stories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Latent Foundation",
    description:
      "A collection of SCP-inspired short stories written with the help of AI.",
    images: ["/images/og-default.svg"], // Same as OG image
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
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "manifest",
        url: "/site.webmanifest",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/favicon-16x16.png"
          sizes="16x16"
          type="image/png"
        />
        <link
          rel="icon"
          href="/favicon-32x32.png"
          sizes="32x32"
          type="image/png"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0a0e16" />
        <meta name="msapplication-TileColor" content="#0a0e16" />
      </head>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
