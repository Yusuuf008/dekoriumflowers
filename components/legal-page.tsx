import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Category } from "@/lib/types";
import { SiteHeader } from "./site-header";

type LegalSection = { title: string; paragraphs: string[] };

export function LegalPage({ categories, eyebrow, title, intro, sections }: { categories: Category[]; eyebrow: string; title: string; intro: string; sections: LegalSection[] }) {
  return <div className="legal-page"><SiteHeader categories={categories}/><main><Link className="legal-back" href="/"><ArrowLeft/> Ana sayfaya dön</Link><header className="legal-hero"><p>{eyebrow}</p><h1>{title}</h1><span>{intro}</span></header><article className="legal-content">{sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</article></main><footer className="legal-footer"><span>© {new Date().getFullYear()} Dekorium Flowers</span><nav><Link href="/gizlilik">Gizlilik</Link><Link href="/kullanim-kosullari">Kullanım koşulları</Link><a href="https://ajjans.tr" target="_blank" rel="noreferrer">ajjans.tr</a></nav></footer></div>;
}
