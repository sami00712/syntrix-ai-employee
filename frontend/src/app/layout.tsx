import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";

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
  title: {
    default: "Syntrix AI - AI Employee Platform for Modern Businesses",
    template: "%s | Syntrix AI",
  },
  description: "AI Employee Platform for Modern Businesses. Deploy autonomous AI agents, capture leads, and automate 24/7 customer support.",
  authors: [{ name: "Syntrix Labs" }],
  creator: "Syntrix Labs",
  publisher: "Syntrix Labs",
  keywords: ["AI employee", "AI agent", "chatbot", "lead capture", "customer support", "Syntrix AI", "automation"],
  openGraph: {
    title: "Syntrix AI - AI Employee Platform",
    description: "Deploy autonomous AI agents for your business. Scale support, capture leads, and automate 24/7.",
    url: "https://syntrix.ai",
    siteName: "Syntrix AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syntrix AI - AI Employee Platform",
    description: "Deploy autonomous AI agents for your business. Scale support, capture leads, and automate 24/7.",
  },
  icons: {
    icon: "/fav.png",
    shortcut: "/fav.png",
    apple: "/fav.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
