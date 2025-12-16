import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MemVault - Memory as a Service",
  description: "Professional SaaS Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
