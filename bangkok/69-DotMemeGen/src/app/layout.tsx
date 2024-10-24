import "./globals.css";
import { Poppins } from "next/font/google";
import { ConfigProvider } from "antd";
import { antdTheme } from "../../antdTheme";
import { ReactNode } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ApiContextProvider } from "../context/ApiContext";
import { UserDetailsContextProvider } from "../context/userDetailsContext";
import { poppins } from "../types";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} ${poppins.variable} bg-[#3E3D3D]`}>
        <AntdRegistry>
          <ConfigProvider theme={antdTheme}>
            <ApiContextProvider>
              <UserDetailsContextProvider>
                {children}
              </UserDetailsContextProvider>
            </ApiContextProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
