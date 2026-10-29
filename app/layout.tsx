import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "3D konfigurátor | Ateliér venku",
  description:
    "3D konfigurátor pergoly — typ střechy, rozměry, barvy, výplně a poptávka.",
};

export const viewport: Viewport = {
  themeColor: "#e8ece6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full font-sans text-ink">{children}</body>
    </html>
  );
}
