import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forever System",
  description: "No zero days.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
