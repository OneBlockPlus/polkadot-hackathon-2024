import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import dynamic from "next/dynamic";
import { Providers } from "@/providers";

export const metadata: Metadata = {
  title: "soft.law",
  description: "The Itellectual Property Chain",
};
const NavBar = dynamic(() => import("@/components/NavBar"), {
  ssr: false,
});
// import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {/* <NavBar/> */}
          {children}
          <Toaster />
          {/* <Footer/> */}
        </Providers>
      </body>
    </html>
  );
}
