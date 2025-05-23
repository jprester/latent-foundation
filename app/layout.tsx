import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCP Stories Collection",
  description: "A collection of SCP-inspired short stories",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
