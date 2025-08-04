import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Poppins } from "next/font/google";
import SWRProvider from "@/providers/SWRProvider";
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
        </head>
        <body className="font-sans antialiased">
          <SWRProvider>{children}</SWRProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
