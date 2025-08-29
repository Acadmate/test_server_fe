import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/shared/navbar";
import dynamic from "next/dynamic";
import ServiceWorkerUpdate from "./ServiceWorkerUpdate";
import { Suspense } from "react";

// Load Menu component dynamically with loading fallback
const Menu = dynamic(() => import("@/components/shared/menu"), {
  ssr: false,
  loading: () => <div className="fixed top-0 left-0 bottom-0 right-0 flex flex-row items-center justify-center h-screen w-screen lg:w-[73vw] lg:ml-[27vw] bg-gray-300 dark:bg-[#0F0F0F]">
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
});

const SheetSide = dynamic(() => import("@/components/shared/sheetNav").then(mod => mod.SheetSide), {
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
          {Array(5).fill(0).map((_, i) => (
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
});

// Optimize font loading
const roboto = Roboto_Flex({
  subsets: ["latin"],
  weight: "500",
  preload: true,
});

export const metadata: Metadata = {
  title: "Acadmate",
  description: "Acadmate is your one-stop solution for educational resources, and academic support.",
  keywords: "SRM, SRM academia, academia pro, acadmate SRM, SRM student portal, SRM University, SRM katankulathur, education, learning, academic resources, tutorials, study support",
  openGraph: {
    title: "Acadmate",
    description: "Unlock your academic potential with Acadmate's powerful resources.",
    url: "https://acadmate.in",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@acadmate",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "manifest",
        url: "/manifest.json",
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
      <Suspense fallback={null}>
        <Navbar />
        <Menu />
      </Suspense>
        <SheetSide />
        <Providers>{children}</Providers>
        <ServiceWorkerUpdate />
      </body>
    </html>
  );
}