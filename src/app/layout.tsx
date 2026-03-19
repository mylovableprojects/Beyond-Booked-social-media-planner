import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Beyond Booked — The Party Rental Content Engine",
  description:
    "Generate weeks of high-converting social media posts in minutes — built specifically for party rental businesses.",
  openGraph: {
    title: "Beyond Booked — The Party Rental Content Engine",
    description:
      "Generate weeks of high-converting social media posts in minutes — built specifically for party rental businesses.",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Beyond Booked — The Party Rental Content Engine" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beyond Booked — The Party Rental Content Engine",
    description:
      "Generate weeks of high-converting social media posts in minutes — built specifically for party rental businesses.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
