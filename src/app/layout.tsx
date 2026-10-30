import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

// Rounded, friendly fonts: Nunito for reading, Fredoka for headings.
const nunito = Nunito({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "AdaptiveMinds – Learn, Play and Create",
  description:
    "A bright, calm learning world for kids: math, reading and science quests, read-aloud stories, art and craft, music and games.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${fredoka.variable} font-sans`}>{children}</body>
    </html>
  );
}
