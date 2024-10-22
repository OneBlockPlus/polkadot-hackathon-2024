import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { UserContextProvider } from "@/components/providers/user-context";
import { ClientProviders } from "@/components/providers/client-provider";
import { Toaster } from "@/components/ui/toaster"
import NextTopLoader from 'nextjs-toploader';
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

export const metadata = {
  title: "Seamless Web3 Payments & Invoicing for Modern Merchants",
  description:
    "Effortlessly create invoices and payment links using our Web3 platform. Accept payments in crypto, manage transactions, and streamline your merchant operations.",

  keywords: [
    "Web3 payments",
    "Crypto payments",
    "recurring payments",
    "Telegram subscription",
    "earn from Telegram",
    "Zap",
  ],

  openGraph: {
    title: "Seamless Web3 Payments & Invoicing for Modern Merchants",
    description:
      "Effortlessly create invoices and payment links using our Web3 platform. Accept payments in crypto, manage transactions, and streamline your merchant operations.",
    url: "https://www.munapay.xyz",
    images: [
      {
        url: "/img/monitize-tg.png",
        width: 800,
        height: 600,
        alt: "Monetize your Telegram community with Zap",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Seamless Web3 Payments & Invoicing for Modern Merchants",
    description:
      "Effortlessly create invoices and payment links using our Web3 platform. Accept payments in crypto, manage transactions, and streamline your merchant operations.",
    images: ["/images/monetize-tg.png"],
  },


};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>
        <UserContextProvider>
        <NextTopLoader
        color="#f97316"
        showSpinner={false}
        />
        {children}
        <Toaster  />
        </UserContextProvider>
        </ClientProviders>

      </body>
    </html>
  );
}
