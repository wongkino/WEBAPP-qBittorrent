import type { Metadata, Viewport } from "next";
import { SafeAreaBootScript } from "@/components/boot/SafeAreaBootScript";
import { ThemeBootScript } from "@/components/boot/ThemeBootScript";
import "./globals.css";

export const metadata: Metadata = {
  title: "qBittorrent",
  description: "Personal qBittorrent remote for web and iOS home screen",
  applicationName: "qBittorrent",
  manifest: "/manifest.webmanifest",
  // iOS 主畫面 Web App：capable=yes 後 status-bar-style 才生效
  // default=白底狀態列 | black=黑底 | black-translucent=沉浸式（夜間預設）
  appleWebApp: {
    capable: true,
    title: "qBittorrent",
    statusBarStyle: "black-translucent",
    startupImage: "/apple-touch-startup-image.png",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning data-theme="dark">
      <head>
        {/* iOS 7 以前無高光圓角；與 apple-touch-icon 並存無妨 */}
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon.png" />
        <ThemeBootScript />
        <SafeAreaBootScript />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
