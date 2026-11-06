import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return <main className="not-found-page"><div className="not-found-content"><p>404 — SAYFA BULUNAMADI</p><h1>Aradığınız çiçek<br/>burada açmamış.</h1><span>Bağlantı değişmiş ya da sayfa artık mevcut olmayabilir.</span><Link href="/"><ArrowLeft/> Ana sayfaya dön</Link></div></main>;
}
