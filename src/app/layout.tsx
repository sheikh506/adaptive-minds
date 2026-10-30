import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

// Rounded, friendly fonts: Nunito for reading, Fredoka for headings.
const nunito = Nunito({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "AdaptiveMinds – Learn, Play and Create",
  description:
    "A bright, calm learning world for kids: math, reading and science quests, read-aloud stories, art and craft, music and games.",
  manifest: "/manifest.json",
  themeColor: "#6366f1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AdaptiveMinds",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AdaptiveMinds" />
      </head>
      <body className={`${nunito.variable} ${fredoka.variable} font-sans`}>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
