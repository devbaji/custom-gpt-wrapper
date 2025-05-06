import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import RootLayoutClient from "./components/RootLayoutClient";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appName = process.env.APP_NAME || "GPT Wrapper";

export const metadata: Metadata = {
  title: appName,
  description: "A custom ChatGPT wrapper for personal use",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.svg",
    apple: "/icons/icon-192x192.png",
  },
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootLayoutClient
      appName={appName}
      geistSans={geistSans.variable}
      geistMono={geistMono.variable}
    >
      {children}
    </RootLayoutClient>
  );
}
