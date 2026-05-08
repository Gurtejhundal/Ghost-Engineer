import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "Ghost Engineer",
  description: "Open-source impact lab for turning social problems into project kits.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/ghost-engineer-favicon-round.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Ghost Engineer",
    description: "Open-source impact lab for turning social problems into project kits.",
    images: ["/ghost-engineer-logo-full.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
