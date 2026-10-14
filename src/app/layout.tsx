import type { Metadata } from "next";
import { headers } from "next/headers";
import { Space_Grotesk, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

// Self-hosted at build time -> no external font requests, tight CSP.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NIGHATS 1.0 — Nigerian Hacker Festival",
  description:
    "Cybersecurity conference & community hacker gathering. Lagos, Nigeria. Planned: Oct–Dec 2027.",
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Nonce injected by middleware; Next stamps it on its own scripts.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>{nonce ? <meta property="csp-nonce" content={nonce} /> : null}</head>
      <body className="min-h-screen bg-void text-fg antialiased">{children}</body>
    </html>
  );
}
