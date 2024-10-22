import "./globals.css";
import { Header } from "@app/components/Header";
import { themes } from "@app/themes";
import { Flowbite, ThemeModeScript } from "flowbite-react";
import type { Metadata } from "next";
import { TCBFooter } from "@app/components/Footer";
import { Inter } from "next/font/google";
import { Container } from "./components/Container/Container";

const fontIter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Bookadot",
    description: "Bookadot",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={fontIter.className}>
            <head>
                <ThemeModeScript />
                <title>Bookadot</title>
                {/* Standard Favicon */}
                <link rel="icon" type="image/jpeg" href="https://s3.ap-southeast-1.amazonaws.com/cdn.thecosmicblock.com/bookadot-icon.png" />

                {/* For iOS */}
                <link rel="apple-touch-icon" href="https://s3.ap-southeast-1.amazonaws.com/cdn.thecosmicblock.com/bookadot-icon.png" />
                <link rel="apple-touch-icon" sizes="76x76" href="https://s3.ap-southeast-1.amazonaws.com/cdn.thecosmicblock.com/bookadot-icon.png" />
                <link rel="apple-touch-icon" sizes="120x120" href="https://s3.ap-southeast-1.amazonaws.com/cdn.thecosmicblock.com/bookadot-icon.png" />
                <link rel="apple-touch-icon" sizes="152x152" href="https://s3.ap-southeast-1.amazonaws.com/cdn.thecosmicblock.com/bookadot-icon.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="https://s3.ap-southeast-1.amazonaws.com/cdn.thecosmicblock.com/bookadot-icon.png" />

                {/* Android */}
                <link rel="icon" sizes="192x192" href="https://s3.ap-southeast-1.amazonaws.com/cdn.thecosmicblock.com/bookadot-icon.png" />
                <link rel="icon" sizes="256x256" href="https://s3.ap-southeast-1.amazonaws.com/cdn.thecosmicblock.com/bookadot-icon.png" />
                <link rel="icon" sizes="384x384" href="https://s3.ap-southeast-1.amazonaws.com/cdn.thecosmicblock.com/bookadot-icon.png" />
                <link rel="icon" sizes="512x512" href="https://s3.ap-southeast-1.amazonaws.com/cdn.thecosmicblock.com/bookadot-icon.png" />

                {/* For Windows (pinned site) */}
                <meta name="msapplication-TileImage" content="https://s3.ap-southeast-1.amazonaws.com/cdn.thecosmicblock.com/bookadot-icon.png" />
                <meta name="msapplication-TileColor" content="#ffffff" />

                {/* General meta for theming */}
                <meta name="theme-color" content="#ffffff" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1,user-scalable=0" />
            </head>
            <body className={"flex w-full flex-col items-center"}>
                <Flowbite theme={{ mode: "dark", theme: themes }}>
                    <Container className={`min-h-[70vh] w-full p-5`}>
                        <Header></Header>
                        {children}
                        <TCBFooter></TCBFooter>
                    </Container>
                </Flowbite>
            </body>
        </html>
    );
}
