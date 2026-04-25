import type { Metadata } from "next";
import "@/app/globals.css";

import { PlatformProviders } from "@/components/platform-providers";
import ClientRoot from "@/components/client-root";

export const metadata: Metadata = {
  title: "Circular Finder",
  description: "Know how it's made. Know how it fits. Know your impact."
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PlatformProviders>
          <ClientRoot>{children}</ClientRoot>
        </PlatformProviders>
      </body>
    </html>
  );
}
