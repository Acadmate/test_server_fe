import type { Metadata } from "next";
import Head from "next/head"; // Added for SEO enhancements
import { Roboto_Flex } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/shared/navbar";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Acadmate",
  description: "Acadmate is your one-stop solution for educational resources, and academic support.",
  keywords: "SRM , SRM academia, academia pro, acadmate SRM, SRM student portal, SRM University, SRM katankulathur ,education, learning, academic resources, tutorials, study support",
  openGraph: {
    title: "Acadmate",
    description: "Unlock your academic potential with Acadmate's powerful resources.",
    url: "https://acadmate.in",
    type: "website",
    // images: [
    //   {
    //     url: "/images/acadmate-banner.png",
    //     width: 1200,
    //     height: 630,
    //     alt: "Acadmate - Empowering Education",
    //   },
    // ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@acadmate",
  },
};

const roboto = Roboto_Flex({
  subsets: ["latin"],
  weight: "500",
});

const Menu = dynamic(() => import("@/components/shared/menu"), { ssr: false });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

        {/* Apple Touch Icon (iOS Home Screen Icon) */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* Android Chrome Icons (Progressive Web App Support) */}
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />

        {/* Web App Manifest for PWA (Progressive Web App) */}
        <link rel="manifest" href="/site.webmanifest" />

        {/* Theme Color for Mobile UI Styling */}
        <meta name="theme-color" content="#ffffff" />

        {/* Essential Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />

        {/* Structured Data (JSON-LD) for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Acadmate",
              "url": "https://acadmate.in",
              "logo": "https://acadmate.in/favicon.ico",
              "sameAs": [
                // "https://www.facebook.com/acadmate",
                // "https://twitter.com/acadmate",
                // "https://www.linkedin.com/company/acadmate"
              ]
            }),
          }}
        />
      </Head>

      <body className={`${roboto.className} antialiased`}>
        <div>
          <Menu />
          <Navbar />
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
