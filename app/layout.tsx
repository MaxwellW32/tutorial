import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// next/font downloads the font at build time and serves it from your own domain:
// no request to Google at runtime, and no layout shift while the font loads.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The default <title> and description. Pages can override the title; the template keeps the suffix.
export const metadata: Metadata = {
  title: { default: "Next.js Tutorial", template: "%s · Next.js Tutorial" },
  description: "A hands-on guide to Next.js, React and TypeScript, with auth, a database, email and APIs.",
};

// The root layout wraps EVERY page. It is the only place with <html> and <body>.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
