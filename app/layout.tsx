import type { Metadata } from "next";
import { Toaster } from "sonner";
import { SiteMotion } from "@/components/site-motion";
import "./globals.css";
import "./commerce.css";

export const metadata: Metadata = {
  title: "Dekorium Flowers | Kayseri Çiçek Siparişi",
  description: "Özenle hazırlanan çiçekleri keşfedin, sepetinizi oluşturun ve WhatsApp üzerinden kolayca sipariş verin.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        <SiteMotion>{children}</SiteMotion>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
