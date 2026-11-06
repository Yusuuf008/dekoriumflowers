"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Flower2, Instagram, MapPin, Menu, Minus, PenLine, Plus, Search, ShieldCheck, ShoppingBag, Sparkles, Trash2, Truck, X } from "lucide-react";
import { toast } from "sonner";
import { CartItem, Category, Product } from "@/lib/types";
import { SiteHeader } from "./site-header";
import { HeroCarousel } from "./hero-carousel";
import { ADMIN_STORAGE, defaultBanners, defaultStoreSettings, readLocal } from "@/lib/admin-local";
import { Banner, StoreSettings } from "@/lib/types";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export function Storefront({ initialCategories, initialProducts }: { initialCategories: Category[]; initialProducts: Product[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [visible, setVisible] = useState(4);
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [banners, setBanners] = useState<Banner[]>(defaultBanners);
  const [settings, setSettings] = useState<StoreSettings>(defaultStoreSettings);

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem("dekorium-cart") || "[]")); } catch { /* empty */ }
    setProducts(readLocal(ADMIN_STORAGE.products, initialProducts));
    setCategories(readLocal(ADMIN_STORAGE.categories, initialCategories));
    setBanners(readLocal(ADMIN_STORAGE.banners, defaultBanners));
    setSettings(readLocal(ADMIN_STORAGE.settings, defaultStoreSettings));
  }, []);
  useEffect(() => { localStorage.setItem("dekorium-cart", JSON.stringify(cart)); }, [cart]);

  const roots = categories.filter((c) => !c.parent_id && c.is_active !== false);
  const descendantIds = (id: string) => [id, ...categories.filter(c => c.parent_id === id).map(c => c.id)];
  const filtered = useMemo(() => products.filter((p) => {
    if (p.is_active === false) return false;
    const categoryMatch = category === "all" || descendantIds(category).includes(p.category_id);
    const textMatch = `${p.name} ${p.description}`.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr"));
    return categoryMatch && textMatch;
  }), [category, query, products, categories]);

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const add = (product: Product) => {
    setCart(items => items.some(i => i.id === product.id) ? items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) : [...items, { ...product, quantity: 1 }]);
    toast.success(`${product.name} sepete eklendi`);
  };
  const change = (id: string, delta: number) => setCart(items => items.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  const checkout = () => {
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905416018627";
    const lines = cart.map((i, n) => `${n + 1}. ${i.name} × ${i.quantity} — ${money.format(i.price * i.quantity)}`);
    const message = [`Merhaba Dekorium Flowers, aşağıdaki ürünleri sipariş vermek istiyorum:`, "", ...lines, "", `Toplam: ${money.format(total)}`, "", "Teslimat adresi ve kart notunu ayrıca paylaşacağım."].join("\n");
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return <div className="site-shell">
    <SiteHeader categories={categories} products={products.filter(product=>product.is_active!==false)} onCartClick={()=>setCartOpen(true)}/>

    <main id="top">
      <HeroCarousel banners={banners}/>

      <section className="category-section" aria-label="Kategoriler">
        <div className="section-heading"><div><p className="eyebrow">KOLEKSİYONLAR</p><h2>Hislerinize göre seçin.</h2></div><p>Her ana, her insana ve her güzel habere eşlik edecek bir çiçek var.</p></div>
        <div className="category-grid">{roots.slice(0, 4).map((cat, i) => <Link key={cat.id} className="category-card" href={`/kategori/${cat.slug}`}><Image src={cat.image_url!} alt="" fill sizes="(max-width: 600px) 50vw, 25vw" /><span className="category-index">0{i + 1}</span><div><h3>{cat.name}</h3><p>{cat.description}</p><ArrowRight /></div></Link>)}</div>
      </section>

      <section id="koleksiyon" className="products-section">
        <div className="section-heading"><div><p className="eyebrow">SİZİN İÇİN SEÇTİK</p><h2>Taze. Zarif. Unutulmaz.</h2></div><p>Her biri siparişinizle birlikte taze çiçeklerden hazırlanır. Görseller mevsime göre küçük farklılıklar gösterebilir.</p></div>
        <div className="filter-row"><Link className="active" href="/kategori/tum-urunler">Tümü</Link>{roots.map(c => <Link key={c.id} href={`/kategori/${c.slug}`}>{c.name}</Link>)}</div>
        {filtered.length ? <div className="product-grid">{filtered.slice(0, visible).map(product => <article className="product-card" key={product.id}><div className="product-image"><Link href={`/urun/${product.slug}`} aria-label={`${product.name} detayları`}><Image src={product.image_url} alt={product.name} fill sizes="(max-width: 700px) 50vw, 25vw" /></Link>{product.compare_at_price && <span className="badge">Özel fiyat</span>}<button className="quick-add" onClick={() => add(product)} aria-label={`${product.name} sepete ekle`}><Plus /><span>Sepete ekle</span></button></div><div className="product-info"><div><h3><Link href={`/urun/${product.slug}`}>{product.name}</Link></h3><p>{product.stock_status === "made_to_order" ? "Sipariş üzerine hazırlanır" : "Stokta"}</p></div><div className="price">{product.compare_at_price && <del>{money.format(product.compare_at_price)}</del>}<strong>{money.format(product.price)}</strong></div></div></article>)}</div> : <div className="empty-products"><p>Bu seçimde henüz ürün bulunmuyor.</p><button onClick={() => { setCategory("all"); setQuery(""); }}>Tüm ürünleri göster</button></div>}
        {visible < filtered.length && <button className="secondary-button" onClick={() => setVisible(v => v + 4)}>Daha fazlasını göster <ChevronDown /></button>}
      </section>

      <section className="commerce-assurance" aria-label="Dekorium hizmet güvenceleri"><div><Truck/><span><strong>Aynı gün hazırlık</strong><em>Uygun siparişlerde hızlı teslimat</em></span></div><div><Flower2/><span><strong>Taze çiçek garantisi</strong><em>Her sipariş için günlük seçki</em></span></div><div><ShieldCheck/><span><strong>Güvenli sipariş</strong><em>WhatsApp üzerinden birebir onay</em></span></div><div><PenLine/><span><strong>Kişiye özel not</strong><em>Mesajınızı karta ekliyoruz</em></span></div></section>
    </main>
    <footer className="site-footer"><div className="footer-top"><div className="footer-intro"><Link href="/" className="brand footer-brand"><span>D</span><div>DEKORIUM<small>FLOWERS</small></div></Link><p>Kayseri’de taze çiçeklerle<br/>özenle hazırlanan tasarımlar.</p><a className="footer-social" href={`https://www.instagram.com/${settings.instagram}/`} target="_blank" rel="noreferrer" aria-label="Dekorium Flowers Instagram hesabı"><Instagram/> @{settings.instagram} <ArrowUpRight/></a></div><div className="footer-column"><h4>Alışveriş</h4><Link href="/kategori/tum-urunler">Tüm ürünler</Link>{roots.slice(0,3).map(c=><Link href={`/kategori/${c.slug}`} key={c.id}>{c.name}</Link>)}</div><div className="footer-column"><h4>Müşteri Hizmetleri</h4><a href="#">Sipariş takibi</a><a href="#">Sıkça sorulan sorular</a><a href="#">Teslimat ve iade</a><Link href="/gizlilik">KVKK ve gizlilik</Link></div><div className="footer-contact"><h4>Mağaza</h4><p className="store-address"><MapPin/><span>{settings.address}</span></p><span>WhatsApp sipariş ve iletişim<br/><a href={`https://wa.me/${settings.phone.replace(/\D/g,"").replace(/^0/,"90")}`} target="_blank" rel="noreferrer">{settings.phone}</a></span><small>{settings.working_hours}</small><Link href="/kategori/tum-urunler">Çiçekleri keşfet <ArrowRight/></Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Dekorium Flowers. Tüm hakları saklıdır.</span><div className="footer-legal"><Link href="/gizlilik">Gizlilik</Link><Link href="/kullanim-kosullari">Kullanım koşulları</Link></div><a className="footer-credit" href="https://ajjans.tr" target="_blank" rel="noreferrer"><span>Tasarım &amp; geliştirme</span><strong>ajjans.tr</strong><ArrowUpRight/></a></div></footer>

    {cartOpen && <><div className="overlay" onClick={() => setCartOpen(false)} /><aside className="cart-drawer"><div className="drawer-head"><div><p>ALIŞVERİŞ SEPETİ</p><h2>{count ? `${count} ürün sizi bekliyor` : "Sepetiniz boş"}</h2></div><button onClick={() => setCartOpen(false)} aria-label="Sepeti kapat"><X /></button></div>{cart.length ? <><div className="cart-items">{cart.map(item => <div className="cart-item" key={item.id}><div className="cart-thumb"><Image src={item.image_url} alt="" fill sizes="90px" /></div><div className="cart-item-body"><h3>{item.name}</h3><p>{money.format(item.price)}</p><div className="quantity"><button onClick={() => change(item.id, -1)}>{item.quantity === 1 ? <Trash2 /> : <Minus />}</button><span>{item.quantity}</span><button onClick={() => change(item.id, 1)}><Plus /></button></div></div></div>)}</div><div className="cart-footer"><div className="cart-total"><span>Toplam</span><strong>{money.format(total)}</strong></div><p>Teslimat ücreti adresinize göre WhatsApp üzerinden netleşir.</p><button className="whatsapp-button" onClick={checkout}><span>WhatsApp’tan Sipariş Ver</span><ArrowRight /></button></div></> : <div className="empty-cart"><ShoppingBag /><p>Beğendiğiniz çiçekleri ekleyin,<br/>siparişinizi birlikte tamamlayalım.</p><button onClick={() => setCartOpen(false)}>Koleksiyonu keşfet</button></div>}</aside></>}
  </div>;
}
