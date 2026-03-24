import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans } from "next/font/google";
import Script from "next/script";
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

export const viewport: Viewport = {
  themeColor: "#10172c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Beyond Booked — Social Media for Party Rental Businesses",
  description:
    "Generate weeks of high-converting social media posts in minutes — built specifically for party rental businesses.",
  appleWebApp: {
    capable: true,
    title: "Beyond Booked",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Beyond Booked — Social Media for Party Rental Businesses",
    description:
      "Generate weeks of high-converting social media posts in minutes — built specifically for party rental businesses.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Beyond Booked — Social Media for Party Rental Businesses" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beyond Booked — Social Media for Party Rental Businesses",
    description:
      "Generate weeks of high-converting social media posts in minutes — built specifically for party rental businesses.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.svg",
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
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
      <Script
        id="clarity-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","vyhoa1jb98");`,
        }}
      />
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-DBQPMGTKWW"
        strategy="afterInteractive"
      />
      <Script
        id="ga-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-DBQPMGTKWW');`,
        }}
      />
    </html>
  );
}
