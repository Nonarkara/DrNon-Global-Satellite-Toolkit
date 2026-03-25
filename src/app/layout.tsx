import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DrNon Global Satellite Toolkit",
  description:
    "Dashboard template with 30 pluggable data-source modules, satellite imagery overlays, and global awareness APIs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[var(--bg)] text-[var(--ink)] antialiased">
        {children}
      </body>
    </html>
  );
}
