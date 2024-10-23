import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '@/lib/theme';
import { PolkadotProvider } from '@/providers/PolkadotProvider';
import { WalletProvider } from '@/providers/WalletProvider';
import { AppHeader } from '@/components/layout/AppHeader';

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
  title: "24X",
  description: "Real World Derivatives on Polkadot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ChakraProvider theme={theme}>
            <WalletProvider>
          <PolkadotProvider>
              <AppHeader />
              {children}
            </PolkadotProvider>
          </WalletProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}
