import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContractorOps",
  description: "ContractorOps is a site-to-bill automation platform for small contractors."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
