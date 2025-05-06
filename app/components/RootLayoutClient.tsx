'use client';

import { useEffect } from "react";
import { registerServiceWorker } from "../pwa";

interface RootLayoutClientProps {
    children: React.ReactNode;
    appName: string;
    geistSans: string;
    geistMono: string;
}

export default function RootLayoutClient({
    children,
    appName,
    geistSans,
    geistMono,
}: RootLayoutClientProps) {
    useEffect(() => {
        registerServiceWorker();
    }, []);

    return (
        <html lang="en">
            <head>
                <meta name="application-name" content={appName} />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content={appName} />
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="msapplication-TileColor" content="#2563eb" />
                <meta name="msapplication-tap-highlight" content="no" />
                <link rel="icon" type="image/svg+xml" href="/logo.svg" />
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
            </head>
            <body className={`${geistSans} ${geistMono} antialiased`}>
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