import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Startup Intelligence — Discover emerging startups",
  description: "Discover founders, track startup signals, and research emerging companies.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
