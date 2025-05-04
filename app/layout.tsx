import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appName = process.env.APP_NAME || "";

export const metadata: Metadata = {
  title: appName,
  description: "A custom ChatGPT wrapper for personal use",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {process.env.APP_NAME && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.APP_NAME = ${JSON.stringify(process.env.APP_NAME)};`,
            }}
          />
        )}
        {children}
      </body>
    </html>
  );
}
