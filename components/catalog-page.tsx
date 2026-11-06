"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Instagram, MapPin, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Category, Product, CartItem } from "@/lib/types";
import { SiteHeader } from "./site-header";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export function CatalogPage({ categories, products, title, description }: { categories: Category[]; products: Product[]; title: string; description: string }) {
  const [sort, setSort] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");
  const roots = categories.filter((category) => !category.parent_id);
  const clearFilters = () => { setPriceRange("all"); setSort("featured"); };
  const add = (product: Product) => {
    let cart: CartItem[] = [];
    try { cart = JSON.parse(localStorage.getItem("dekorium-cart") || "[]"); } catch { /* empty */ }
    const item = cart.find((cartItem) => cartItem.id === product.id);
    if (item) item.quantity++;
    else cart.push({ ...product, quantity: 1 });
    localStorage.setItem("dekorium-cart", JSON.stringify(cart));
    toast.success(`${product.name} sepete eklendi`);
  };
  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => priceRange === "all" || (priceRange === "under-1000" && product.price < 1000) || (priceRange === "1000-2000" && product.price >= 1000 && product.price <= 2000) || (priceRange === "over-2000" && product.price > 2000));
    return [...filtered].sort((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : sort === "name" ? a.name.localeCompare(b.name, "tr") : 0);
  }, [products, priceRange, sort]);

  return <div className="catalog-page">
    <SiteHeader categories={categories} products={products}/>
    <main>
      <div className="catalog-breadcrumb"><Link href="/">Ana Sayfa</Link><span>/</span>{title}</div>
      <section className="catalog-intro"><h1>{title}</h1><p>{description}</p></section>
      <div className="catalog-toolbar"><span>{visibleProducts.length} ürün</span><label className="catalog-sort"><span>Sırala:</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Önerilenler</option><option value="price-asc">Fiyat: düşükten yükseğe</option><option value="price-desc">Fiyat: yüksekten düşüğe</option><option value="name">Ada göre</option></select></label></div>
      <div className="catalog-layout">
        <aside className="catalog-sidebar" aria-label="Ürün filtreleri">
          <div className="sidebar-heading"><h2>Filtrele</h2><button onClick={clearFilters}>Temizle</button></div>
          <section className="sidebar-group"><h3>Kategoriler</h3><nav><Link href="/kategori/tum-urunler" className={title === "Tüm Ürünler" ? "active" : ""}>Tüm ürünler</Link>{roots.map((category) => <Link href={`/kategori/${category.slug}`} className={title === category.name ? "active" : ""} key={category.id}>{category.name}</Link>)}</nav></section>
          <section className="sidebar-group"><h3>Fiyat aralığı</h3><div className="filter-options">{[["all", "Tüm fiyatlar"], ["under-1000", "1.000 TL altı"], ["1000-2000", "1.000 – 2.000 TL"], ["over-2000", "2.000 TL üzeri"]].map(([value, label]) => <label key={value}><input type="radio" name="price" value={value} checked={priceRange === value} onChange={() => setPriceRange(value)}/><span>{label}</span></label>)}</div></section>
          <section className="sidebar-group sidebar-note"><h3>Hazırlık</h3><p>Siparişleriniz taze çiçeklerle, size özel hazırlanır.</p></section>
        </aside>
        <div className="catalog-results">{visibleProducts.length ? <section className="catalog-product-grid">{visibleProducts.map((product) => <article className="product-card" key={product.id}><div className="product-image"><Link href={`/urun/${product.slug}`}><Image src={product.image_url} alt={product.name} fill sizes="(max-width:700px) 50vw,25vw"/></Link>{product.compare_at_price && <span className="badge">Özel fiyat</span>}<button className="quick-add" onClick={() => add(product)}><Plus/><span>Sepete ekle</span></button></div><div className="product-info"><div><h3><Link href={`/urun/${product.slug}`}>{product.name}</Link></h3><p>Sipariş üzerine hazırlanır</p></div><div className="price"><strong>{money.format(product.price)}</strong></div></div></article>)}</section> : <div className="empty-products"><h2>Sonuç bulunamadı</h2><p>Bu filtrelerde ürün bulunmuyor.</p><button onClick={clearFilters}>Filtreleri temizle</button></div>}</div>
      </div>
    </main>
    <footer className="site-footer"><div className="footer-top"><div className="footer-intro"><Link href="/" className="brand footer-brand"><span>D</span><div>DEKORIUM<small>FLOWERS</small></div></Link><p>Kayseri’de taze çiçeklerle<br/>özenle hazırlanan tasarımlar.</p><a className="footer-social" href="https://www.instagram.com/dekorium_flowers/" target="_blank" rel="noreferrer"><Instagram/> @dekorium_flowers <ArrowUpRight/></a></div><div className="footer-column"><h4>Alışveriş</h4><Link href="/kategori/tum-urunler">Tüm ürünler</Link>{roots.slice(0, 3).map((category) => <Link href={`/kategori/${category.slug}`} key={category.id}>{category.name}</Link>)}</div><div className="footer-column"><h4>Müşteri Hizmetleri</h4><Link href="/gizlilik">KVKK ve gizlilik</Link><Link href="/kullanim-kosullari">Kullanım koşulları</Link></div><div className="footer-contact"><h4>Mağaza</h4><p className="store-address"><MapPin/><span>Gülük Mahallesi, Ünönü Bulvarı<br/>Fatih Çarşısı No: 20/B, Kayseri</span></p><span>WhatsApp sipariş ve iletişim<br/><a href="https://wa.me/905416018627" target="_blank" rel="noreferrer">0541 601 86 27</a></span><Link href="/kategori/tum-urunler">Çiçekleri keşfet <ArrowRight/></Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Dekorium Flowers. Tüm hakları saklıdır.</span><div className="footer-legal"><Link href="/gizlilik">Gizlilik</Link><Link href="/kullanim-kosullari">Kullanım koşulları</Link></div><a className="footer-credit" href="https://ajjans.tr" target="_blank" rel="noreferrer"><span>Tasarım &amp; geliştirme</span><strong>ajjans.tr</strong><ArrowUpRight/></a></div></footer>
  </div>;
}
