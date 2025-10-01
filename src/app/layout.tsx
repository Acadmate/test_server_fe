import type { Metadata, Viewport } from "next";
import { Roboto_Flex } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/shared/navbar";
import dynamic from "next/dynamic";
// import ServiceWorkerInit from "@/components/shared/ServiceWorkerInit";
import { Suspense } from "react";
import AppLoadingManager from "@/components/shared/AppLoadingManager";
import PWAInstallPrompt from "@/components/shared/PWAInstallPrompt";

// Load Menu component dynamically with loading fallback
const Menu = dynamic(() => import("@/components/shared/menu"), {
  ssr: false,
  loading: () => (
    <div className="fixed top-0 left-0 bottom-0 right-0 flex flex-row items-center justify-center h-screen w-screen lg:w-[73vw] lg:ml-[27vw] bg-gray-300 dark:bg-[#0F0F0F]">
      <div className="ui-abstergo">
        <div className="abstergo-loader">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="ui-text">
          Bothering Academia
          <div className="ui-dot"></div>
          <div className="ui-dot"></div>
          <div className="ui-dot"></div>
        </div>
      </div>
    </div>
  ),
});

const SheetSide = dynamic(
  () => import("@/components/shared/sheetNav").then((mod) => mod.SheetSide),
  {
    ssr: false,
    loading: () => (
      <div className="hidden lg:flex flex-col w-[25vw] h-screen fixed left-0 top-0 z-40 pl-2 py-2 rounded-xl">
        <div className="h-full w-full bg-white dark:bg-[#0F0F0F] shadow-md border px-4 py-6 rounded-xl animate-pulse">
          <div className="h-8 w-3/4 bg-gray-300 dark:bg-[#1f1f1f] rounded mb-6 mx-auto" />

          <div className="mb-4 space-y-2">
            <div className="h-4 w-1/2 bg-gray-300 dark:bg-[#1f1f1f] rounded" />
            <div className="h-3 w-full bg-gray-200 dark:bg-[#222222] rounded" />
          </div>

          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-2 py-2 rounded-lg bg-gray-100 dark:bg-[#1a1a1a]"
                >
                  <div className="h-6 w-6 bg-gray-300 dark:bg-[#2a2a2a] rounded" />
                  <div className="h-4 w-3/5 bg-gray-300 dark:bg-[#2a2a2a] rounded" />
                </div>
              ))}
          </div>
        </div>
      </div>
    ),
  }
);

// Optimize font loading with fallback
const roboto = Roboto_Flex({
  subsets: ["latin"],
  weight: "500",
  preload: true,
  display: "swap",
  fallback: ["system-ui", "arial"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1a1a1a" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

export const metadata: Metadata = {
  title: "Acadmate",
  description:
    "Acadmate is your one-stop solution for educational resources, and academic support.",
  keywords:
    "SRM, SRM academia, academia pro, acadmate SRM, SRM student portal, SRM University, SRM katankulathur, education, learning, academic resources, tutorials, study support",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Acadmate",
    startupImage: ["/android-chrome-192x192.png"],
  },
  openGraph: {
    title: "Acadmate",
    description:
      "Unlock your academic potential with Acadmate's powerful resources.",
    url: "https://acadmate.in",
    type: "website",
    siteName: "Acadmate",
  },
  twitter: {
    card: "summary_large_image",
    site: "@acadmate",
    title: "Acadmate",
    description: "Your Academic Companion",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "manifest",
        url: "/manifest.json",
      },
      {
        rel: "mask-icon",
        url: "/android-chrome-192x192.png",
        color: "#1a1a1a",
      },
      // iOS splash screens
      {
        rel: "apple-touch-startup-image",
        url: "/android-chrome-512x512.png",
        media:
          "screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        rel: "apple-touch-startup-image",
        url: "/android-chrome-512x512.png",
        media:
          "screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        rel: "apple-touch-startup-image",
        url: "/android-chrome-192x192.png",
        media:
          "screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.className} antialiased min-h-screen relative`}>
        <AppLoadingManager>
          <Suspense fallback={null}>
            <Navbar />
            <Menu />
          </Suspense>
          <SheetSide />
          <Providers>{children}</Providers>
          {/* <ServiceWorkerInit /> */}
          <PWAInstallPrompt />
        </AppLoadingManager>
      </body>
    </html>
  );
}
