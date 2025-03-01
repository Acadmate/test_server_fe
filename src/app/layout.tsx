import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/shared/navbar";
import dynamic from "next/dynamic";
import MenuMobileTrigger from "@/components/shared/menuMobileTrigger";

export const metadata: Metadata = {
  title: "Acadmate",
  description: "Just tried something new!!",
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
      <body className={`${roboto.className} antialiased`}>
        <div>
          <MenuMobileTrigger />
          <Menu />
          <Navbar />
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
