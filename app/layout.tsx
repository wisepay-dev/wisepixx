import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://wisepix.online"),
  title: {
    default: "WisePix",
    template: "%s | WisePix"
  },
  description: "Marketplace social, Discord-first e Pix-first para vender produtos digitais.",
  applicationName: "WisePix",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "WisePix",
    statusBarStyle: "black-translucent"
  },
  openGraph: {
    title: "WisePix",
    description: "Venda produtos digitais com Pix, comunidade e proteção.",
    siteName: "WisePix",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#1687ff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
