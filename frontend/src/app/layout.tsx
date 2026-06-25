import type { Metadata } from "next";
import { Providers } from "./Providers";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerHub | Placement Management Platform",
  description: "Multi-tenant B2B SaaS platform for college placement management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" richColors />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
