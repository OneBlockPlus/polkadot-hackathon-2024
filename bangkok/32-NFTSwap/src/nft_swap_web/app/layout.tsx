/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-10-11 20:01:27
 * @LastEditors: Hesin
 * @LastEditTime: 2024-10-15 21:28:23
 */
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProviders";
// import { SubstrateProvider } from "./SubstrateProvider";
import { Toaster } from "@/components/ui/toaster";
import dynamic from "next/dynamic";

const SubstrateProvider = dynamic(
  () => import("./SubstrateProvider").then((mod) => mod.SubstrateProvider),
  {
    ssr: false,
  }
);
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "NFT-Swap",
  description: "Web3 NFT Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body
      // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <SubstrateProvider>{children}</SubstrateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
