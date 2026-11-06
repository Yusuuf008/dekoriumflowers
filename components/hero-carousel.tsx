"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Banner } from "@/lib/types";
import { defaultBanners } from "@/lib/admin-local";

export function HeroCarousel({ banners = defaultBanners }: { banners?: Banner[] }) {
  const slides = banners.filter((banner) => banner.is_active).sort((a, b) => a.sort_order - b.sort_order);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active >= slides.length) setActive(0);
    if (slides.length < 2) return;
    const timer = setInterval(() => setActive((current) => (current + 1) % slides.length), 6500);
    return () => clearInterval(timer);
  }, [active, slides.length]);

  if (!slides.length) return null;
  return <section className="hero-carousel"><div className="hero-slides">{slides.map((s,i)=>{
    const [firstLine, secondLine] = s.title.split("\n");
    return <div className={`hero-slide banner-${i + 1} ${i===active?"active":""}`} key={s.id}>
      <div className="hero-copy"><p className="eyebrow">{s.eyebrow}</p><h1><span>{firstLine}</span>{secondLine && <span>{secondLine}</span>}</h1><p>{s.text}</p><Link className="primary-button" href={s.href}>{s.button}<ArrowRight/></Link><div className="hero-note"><Check/>Siparişinizi WhatsApp’tan kolayca tamamlayın</div></div><div className="hero-visual"><Image src={s.image} alt={s.title.replace("\n", " ")} fill priority={i===0} sizes="100vw"/></div>
    </div>;
  })}</div>{slides.length>1&&<div className="slider-controls"><button onClick={()=>setActive((active+slides.length-1)%slides.length)} aria-label="Önceki banner"><ArrowLeft/></button><div>{slides.map((_,i)=><button className={i===active?"active":""} onClick={()=>setActive(i)} key={i} aria-label={`${i+1}. banner`}/>)}</div><button onClick={()=>setActive((active+1)%slides.length)} aria-label="Sonraki banner"><ArrowRight/></button></div>}</section>;
}
