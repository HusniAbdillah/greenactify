import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Poppins } from "next/font/google";
import SWRProvider from "@/providers/SWRProvider";
import OfflineIndicator from "@/components/OfflineIndicator";
import SplashScreen from "@/components/SplashScreen";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GreenActify",
  description: "Aksi Hijau Hari Ini, Nafas Segar Esok Hari.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GreenActify",
    startupImage: [
      {
        url: "/apple-splash-2048-2732.png",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/apple-splash-1668-2224.png",
        media:
          "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/apple-splash-1536-2048.png",
        media:
          "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/apple-splash-1125-2436.png",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/apple-splash-1242-2208.png",
        media:
          "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/apple-splash-750-1334.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      <html lang="en" className={poppins.variable}>
        <head>
          <link rel="preconnect" href="https://api.openstreetmap.org" />
          <link rel="preconnect" href="https://img.clerk.com" />
          <link rel="dns-prefetch" href="https://images.pexels.com" />

          {/* PWA Meta Tags */}
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="icon" href="/favicon.ico" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="GreenActify" />
          <meta name="mobile-web-app-capable" content="yes" />

          {/* Splash Screen Meta Tags */}
          <meta name="theme-color" content="#10b981" />
          <meta name="msapplication-navbutton-color" content="#10b981" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />

          {/* iOS Splash Screens */}
          <link
            rel="apple-touch-startup-image"
            href="/apple-splash-2048-2732.png"
            media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          />
          <link
            rel="apple-touch-startup-image"
            href="/apple-splash-1668-2224.png"
            media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          />
          <link
            rel="apple-touch-startup-image"
            href="/apple-splash-1536-2048.png"
            media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          />
          <link
            rel="apple-touch-startup-image"
            href="/apple-splash-1125-2436.png"
            media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          />
          <link
            rel="apple-touch-startup-image"
            href="/apple-splash-1242-2208.png"
            media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          />
          <link
            rel="apple-touch-startup-image"
            href="/apple-splash-750-1334.png"
            media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          />
        </head>
        <body className="font-sans antialiased">
          <SWRProvider>
            <SplashScreen>
              <OfflineIndicator />
              {children}
            </SplashScreen>
          </SWRProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
