"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

const whatsappMessage = "Merhaba Dekorium Flowers, çiçek siparişi ve teslimat hakkında bilgi almak istiyorum.";

export function SiteMotion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(
      ".page-transition main > section, .page-transition main > article, .page-transition .category-card, .page-transition .product-card, .page-transition .legal-content section"
    ));
    targets.forEach((target) => target.classList.add("scroll-reveal"));
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.1, rootMargin: "0px 0px -36px" }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [pathname]);

  const isAdminArea = pathname.startsWith("/yonetim");
  return <><div className={isAdminArea ? "admin-route" : "page-transition"} key={pathname}>{children}</div>{!isAdminArea && <a className="floating-whatsapp" href={`https://wa.me/905416018627?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noreferrer" aria-label="WhatsApp üzerinden iletişime geç"><MessageCircle/><span>İletişime geç</span></a>}</>;
}
