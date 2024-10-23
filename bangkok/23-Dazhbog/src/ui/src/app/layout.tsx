import { Metadata, Viewport } from "next";
import { PropsWithChildren } from "react";

import { Analytics } from "@vercel/analytics/react";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { ToastConfig } from "@/app/toast-config";
import Navbar from "@/components/ui/navbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { env } from "@/config/environment";
import { cn } from "@/utils/cn";

import "./globals.css";
import ClientProviders from "./providers";

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "Dazhbog",
  description: "Dazhbog is..",
  metadataBase: new URL(env.url),
  robots: env.isProduction ? "all" : "noindex,nofollow",
  openGraph: {
    type: "website",
    locale: "en",
    url: env.url,
    siteName: "Dazhbog",
    images: [
      {
        url: "/images/inkathon-og-banner.jpg",
        width: 1280,
        height: 640,
      },
    ],
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html
      lang="en"
      className={cn("dark", GeistSans.variable, GeistMono.variable)}
      suppressHydrationWarning
    >
      <body>
        <ClientProviders>
          <TooltipProvider>
            <Navbar />
            {children}
          </TooltipProvider>
          <ToastConfig />
        </ClientProviders>
      </body>
    </html>
  );
}
