import type { Metadata } from "next";
import "@/app/globals.css";
import { PlatformProviders } from "@/components/platform-providers";

export const metadata: Metadata = {
  title: "Circular Finder",
  description: "Production-grade sustainable fashion platform with live supplier, garment, passport, and marketplace data."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PlatformProviders>{children}</PlatformProviders>
      </body>
    </html>
  );
}
