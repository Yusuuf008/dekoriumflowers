"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowDown, ArrowRight, ArrowUp, Boxes, CheckCircle2, ClipboardList, ExternalLink,
  FolderTree, ImagePlus, Images, LayoutDashboard, LogOut, Package, Pencil, Plus,
  Search, Settings, ShieldCheck, Sparkles, Trash2, X,
} from "lucide-react";
import { toast } from "sonner";
import { AdminOrder, Banner, Category, Product, StoreSettings } from "@/lib/types";
import {
  ADMIN_STORAGE, defaultBanners, defaultOrders, defaultStoreSettings, readLocal, writeLocal,
} from "@/lib/admin-local";

type Tab = "overview" | "products" | "categories" | "orders" | "banners" | "settings" | "security";
type Modal = "product" | "category" | "order" | null;
type Activity = { id: string; text: string; at: string };

const PAGE_SIZE = 8;
const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const slugify = (value: string) => value.toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function AdminDashboard({ initialProducts, initialCategories, isDemo }: { initialProducts: Product[]; initialCategories: Category[]; isDemo: boolean }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [banners, setBanners] = useState<Banner[]>(defaultBanners);
  const [settings, setSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [orders, setOrders] = useState<AdminOrder[]>(defaultOrders);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [modal, setModal] = useState<Modal>(null);
  const [editing, setEditing] = useState<Product | Category | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isDemo) return;
    setProducts(readLocal(ADMIN_STORAGE.products, initialProducts));
    setCategories(readLocal(ADMIN_STORAGE.categories, initialCategories));
    setBanners(readLocal(ADMIN_STORAGE.banners, defaultBanners));
    setSettings(readLocal(ADMIN_STORAGE.settings, defaultStoreSettings));
    setOrders(readLocal(ADMIN_STORAGE.orders, defaultOrders));
    setActivity(readLocal(ADMIN_STORAGE.activity, []));
  }, [isDemo, initialProducts, initialCategories]);

  const log = (text: string) => {
    const next = [{ id: uid("activity"), text, at: new Date().toISOString() }, ...activity].slice(0, 30);
    setActivity(next);
    writeLocal(ADMIN_STORAGE.activity, next);
  };
  const commitProducts = (next: Product[]) => { setProducts(next); if (isDemo) writeLocal(ADMIN_STORAGE.products, next); };
  const commitCategories = (next: Category[]) => { setCategories(next); if (isDemo) writeLocal(ADMIN_STORAGE.categories, next); };
  const commitBanners = (next: Banner[]) => { setBanners(next); writeLocal(ADMIN_STORAGE.banners, next); };
  const commitOrders = (next: AdminOrder[]) => { setOrders(next); writeLocal(ADMIN_STORAGE.orders, next); };

  const rootCategories = categories.filter(category => !category.parent_id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const filtered = useMemo(() => products.filter(product => {
    const text = `${product.name} ${product.sku || ""}`.toLocaleLowerCase("tr");
    const matchesText = text.includes(query.toLocaleLowerCase("tr"));
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? product.is_active !== false : statusFilter === "passive" ? product.is_active === false : product.stock_status === statusFilter);
    return matchesText && matchesStatus;
  }), [products, query, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageProducts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [query, statusFilter]);

  const openModal = (type: Exclude<Modal, null>, record?: Product | Category, parentId?: string) => {
    setEditing(record || null);
    setImagePreviews(record && "image_urls" in record ? (record.image_urls?.length ? record.image_urls : [record.image_url]) : record?.image_url ? [record.image_url] : []);
    setModal(type);
    if (type === "category" && parentId) setTimeout(() => { const element = document.querySelector<HTMLSelectElement>('select[name="parent_id"]'); if (element) element.value = parentId; });
  };
  const closeModal = () => { setModal(null); setEditing(null); setImagePreviews([]); };

  const addLocalImages = (files: FileList | null, limit = 6) => {
    if (!files) return;
    const accepted = Array.from(files).filter(file => {
      if (!file.type.startsWith("image/")) { toast.error(`${file.name} bir görsel değil.`); return false; }
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} 5 MB sınırını aşıyor.`); return false; }
      return true;
    }).slice(0, limit);
    accepted.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setImagePreviews(current => [...current, String(reader.result)].slice(0, limit));
      reader.readAsDataURL(file);
    });
  };

  const saveCatalog = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const isProduct = modal === "product";
    const id = editing?.id || uid(isProduct ? "product" : "category");
    const baseSlug = slugify(String(raw.name));
    const existingSlugs = (isProduct ? products : categories).filter(item => item.id !== id).map(item => item.slug);
    const slug = existingSlugs.includes(baseSlug) ? `${baseSlug}-${String(id).slice(-5)}` : baseSlug;
    const data = isProduct ? {
      id, name: String(raw.name), slug, description: String(raw.description || ""),
      price: Number(raw.price), compare_at_price: raw.compare_at_price ? Number(raw.compare_at_price) : null,
      image_url: imagePreviews[0] || String(raw.image_url || ""), image_urls: imagePreviews,
      category_id: String(raw.category_id), stock_status: raw.stock_status as Product["stock_status"],
      stock_quantity: Number(raw.stock_quantity || 0), sku: String(raw.sku || ""),
      is_active: raw.is_active === "on", is_featured: raw.is_featured === "on",
      seo_title: String(raw.seo_title || ""), seo_description: String(raw.seo_description || ""),
    } satisfies Product : {
      id, name: String(raw.name), slug, description: String(raw.description || ""),
      parent_id: raw.parent_id ? String(raw.parent_id) : null, image_url: imagePreviews[0] || String(raw.image_url || "") || undefined,
      sort_order: Number(raw.sort_order || 0), is_active: raw.is_active === "on",
    } satisfies Category;

    if (isDemo) {
      if (isProduct) commitProducts(editing ? products.map(item => item.id === id ? data as Product : item) : [data as Product, ...products]);
      else commitCategories(editing ? categories.map(item => item.id === id ? data as Category : item) : [...categories, data as Category]);
      log(`${isProduct ? "Ürün" : "Kategori"} ${editing ? "güncellendi" : "eklendi"}: ${data.name}`);
      toast.success(editing ? "Kayıt güncellendi" : "Kayıt eklendi");
      closeModal(); setSaving(false); return;
    }

    try {
      const response = await fetch("/api/admin/catalog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: isProduct ? "products" : "categories", data }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      if (isProduct) setProducts(current => editing ? current.map(item => item.id === body.id ? body : item) : [body, ...current]);
      else setCategories(current => editing ? current.map(item => item.id === body.id ? body : item) : [...current, body]);
      toast.success(editing ? "Kayıt güncellendi" : "Kayıt eklendi"); closeModal();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Kayıt tamamlanamadı"); }
    finally { setSaving(false); }
  };

  const remove = async (type: "products" | "categories", id: string) => {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    if (type === "categories" && (categories.some(item => item.parent_id === id) || products.some(item => item.category_id === id))) {
      toast.error("Bu kategorinin alt kategorileri veya ürünleri bulunuyor."); return;
    }
    if (isDemo) {
      type === "products" ? commitProducts(products.filter(item => item.id !== id)) : commitCategories(categories.filter(item => item.id !== id));
      log(`${type === "products" ? "Ürün" : "Kategori"} silindi`); return;
    }
    const response = await fetch(`/api/admin/catalog?type=${type}&id=${id}`, { method: "DELETE" });
    const body = await response.json();
    if (!response.ok) return toast.error(body.error);
    type === "products" ? setProducts(current => current.filter(item => item.id !== id)) : setCategories(current => current.filter(item => item.id !== id));
  };

  const bulkUpdate = (action: "active" | "passive" | "delete") => {
    if (!selected.length) return;
    if (action === "delete" && !confirm(`${selected.length} ürünü silmek istediğinize emin misiniz?`)) return;
    const next = action === "delete" ? products.filter(product => !selected.includes(product.id)) : products.map(product => selected.includes(product.id) ? { ...product, is_active: action === "active" } : product);
    commitProducts(next); log(`${selected.length} ürüne toplu işlem uygulandı`); setSelected([]); toast.success("Toplu işlem tamamlandı");
  };

  const moveCategory = (category: Category, direction: -1 | 1) => {
    const siblings = categories.filter(item => item.parent_id === category.parent_id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const index = siblings.findIndex(item => item.id === category.id); const target = siblings[index + direction]; if (!target) return;
    const next = categories.map(item => item.id === category.id ? { ...item, sort_order: target.sort_order } : item.id === target.id ? { ...item, sort_order: category.sort_order } : item);
    commitCategories(next); log(`Kategori sırası değiştirildi: ${category.name}`);
  };

  const updateBanner = (id: string, field: keyof Banner, value: string | boolean | number) => commitBanners(banners.map(banner => banner.id === id ? { ...banner, [field]: value } : banner));
  const removeBanner = (id: string) => { if (confirm("Banner silinsin mi?")) { commitBanners(banners.filter(item => item.id !== id)); log("Banner silindi"); } };
  const addBanner = () => commitBanners([...banners, { id: uid("banner"), eyebrow: "YENİ KOLEKSİYON", title: "Yeni banner başlığı", text: "Banner açıklamasını buraya yazın.", image: defaultBanners[0].image, href: "/kategori/tum-urunler", button: "Keşfet", is_active: true, sort_order: banners.length + 1 }]);
  const saveSettings = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = Object.fromEntries(new FormData(event.currentTarget)); const next = Object.fromEntries(Object.keys(defaultStoreSettings).map(key => [key, String(form[key] || "")])) as StoreSettings; setSettings(next); writeLocal(ADMIN_STORAGE.settings, next); log("Mağaza ayarları güncellendi"); toast.success("Mağaza ayarları kaydedildi"); };
  const saveOrder = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const raw = Object.fromEntries(new FormData(event.currentTarget)); const next: AdminOrder = { id: uid("order"), customer: String(raw.customer), phone: String(raw.phone), summary: String(raw.summary), total: Number(raw.total || 0), status: "new", created_at: new Date().toISOString() }; commitOrders([next, ...orders]); log(`Sipariş kaydı eklendi: ${next.customer}`); closeModal(); };
  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); location.reload(); };

  const nav: { id: Tab; label: string; icon: typeof Package; count?: number }[] = [
    { id: "overview", label: "Genel Bakış", icon: LayoutDashboard }, { id: "products", label: "Ürünler", icon: Package, count: products.length },
    { id: "categories", label: "Kategoriler", icon: FolderTree, count: categories.length }, { id: "orders", label: "Siparişler", icon: ClipboardList, count: orders.filter(order => order.status === "new").length },
    { id: "banners", label: "Bannerlar", icon: Images, count: banners.length }, { id: "settings", label: "Mağaza Ayarları", icon: Settings }, { id: "security", label: "Güvenlik", icon: ShieldCheck },
  ];
  const titles: Record<Tab, [string, string]> = {
    overview: ["Genel Bakış", "Mağazanızın güncel durumunu tek ekranda yönetin."], products: ["Ürünler", "Katalog, fiyat ve yayın durumlarını yönetin."], categories: ["Kategoriler", "Ana ve alt kategori yapısını düzenleyin."],
    orders: ["Siparişler", "WhatsApp taleplerini manuel olarak takip edin."], banners: ["Bannerlar", "Ana sayfadaki kayan bannerları yönetin."], settings: ["Mağaza Ayarları", "İletişim ve site bilgilerini güncelleyin."], security: ["Güvenlik", "Yönetim erişimi ve yayın öncesi kontroller."],
  };

  return <div className="admin-shell">
    <aside className="admin-sidebar"><a className="brand" href="/"><span>D</span><div>DEKORIUM<small>YÖNETİM</small></div></a><p className="admin-sidebar-label">MAĞAZA YÖNETİMİ</p><nav>{nav.map(item => { const Icon = item.icon; return <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}><Icon />{item.label}{typeof item.count === "number" && <span>{item.count}</span>}</button>; })}</nav><div className="sidebar-bottom"><a href="/" target="_blank">Mağazayı görüntüle <ExternalLink /></a><button onClick={logout}><LogOut />Çıkış yap</button></div></aside>
    <main className={`admin-main admin-${tab}`}><header><div><p>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date())}</p><h1>{titles[tab][0]}</h1><span>{titles[tab][1]}</span></div>{tab === "products" && <button className="admin-primary" onClick={() => openModal("product")}><Plus />Yeni ürün</button>}{tab === "categories" && <button className="admin-primary" onClick={() => openModal("category")}><Plus />Yeni kategori</button>}{tab === "orders" && <button className="admin-primary" onClick={() => openModal("order")}><Plus />Sipariş ekle</button>}{tab === "banners" && <button className="admin-primary" onClick={addBanner}><Plus />Banner ekle</button>}</header>

      {tab === "overview" && <Overview products={products} categories={categories} orders={orders} activity={activity} setTab={setTab} />}
      {tab === "products" && <section className="admin-workspace"><div className="admin-toolbar"><div className="admin-search"><Search /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Ürün adı veya SKU ara" /></div><select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="all">Tüm durumlar</option><option value="active">Yayında</option><option value="passive">Taslak</option><option value="in_stock">Stokta</option><option value="made_to_order">Sipariş üzerine</option><option value="out_of_stock">Tükendi</option></select><span>{filtered.length} ürün</span></div>{selected.length > 0 && <div className="bulk-bar"><strong>{selected.length} ürün seçildi</strong><button onClick={() => bulkUpdate("active")}>Yayınla</button><button onClick={() => bulkUpdate("passive")}>Taslağa al</button><button className="danger" onClick={() => bulkUpdate("delete")}>Sil</button><button onClick={() => setSelected([])}>Seçimi kaldır</button></div>}<ProductTable products={pageProducts} categories={categories} selected={selected} setSelected={setSelected} remove={id => remove("products", id)} edit={product => openModal("product", product)} toggle={(id, field) => { const next = products.map(product => product.id === id ? { ...product, [field]: !product[field] } : product); commitProducts(next); }} /><div className="pagination"><button disabled={page === 1} onClick={() => setPage(value => value - 1)}>Önceki</button><span>{page} / {pageCount}</span><button disabled={page === pageCount} onClick={() => setPage(value => value + 1)}>Sonraki</button></div></section>}
      {tab === "categories" && <CategoryManager categories={categories} products={products} roots={rootCategories} edit={category => openModal("category", category)} addChild={id => openModal("category", undefined, id)} remove={id => remove("categories", id)} move={moveCategory} toggle={id => commitCategories(categories.map(item => item.id === id ? { ...item, is_active: item.is_active === false } : item))} />}
      {tab === "orders" && <OrderManager orders={orders} update={(id, status) => { const next = orders.map(order => order.id === id ? { ...order, status } : order); commitOrders(next); log("Sipariş durumu güncellendi"); }} remove={id => { if (confirm("Sipariş kaydı silinsin mi?")) commitOrders(orders.filter(order => order.id !== id)); }} />}
      {tab === "banners" && <BannerManager banners={banners} update={updateBanner} remove={removeBanner} save={() => { writeLocal(ADMIN_STORAGE.banners, banners); log("Bannerlar güncellendi"); toast.success("Bannerlar vitrinde güncellendi"); }} />}
      {tab === "settings" && <SettingsPanel settings={settings} save={saveSettings} />}
      {tab === "security" && <SecurityPanel isDemo={isDemo} />}
    </main>

    {modal && <AdminModal modal={modal} editing={editing} categories={categories} roots={rootCategories} previews={imagePreviews} setPreviews={setImagePreviews} addImages={addLocalImages} close={closeModal} saveCatalog={saveCatalog} saveOrder={saveOrder} saving={saving} />}
  </div>;
}

function Overview({ products, categories, orders, activity, setTab }: { products: Product[]; categories: Category[]; orders: AdminOrder[]; activity: Activity[]; setTab: (tab: Tab) => void }) {
  const cards = [
    { label: "Toplam ürün", value: products.length, note: `${products.filter(item => item.is_active !== false).length} yayında`, icon: Package },
    { label: "Kategori", value: categories.length, note: `${categories.filter(item => item.parent_id).length} alt kategori`, icon: FolderTree },
    { label: "Bekleyen sipariş", value: orders.filter(item => item.status === "new").length, note: `${orders.length} toplam kayıt`, icon: ClipboardList },
    { label: "Stok uyarısı", value: products.filter(item => item.stock_status === "out_of_stock" || (item.stock_quantity ?? 1) === 0).length, note: "Kontrol edilmeli", icon: Boxes },
  ];
  return <><section className="stat-grid admin-stat-four">{cards.map(card => { const Icon = card.icon; return <article key={card.label}><div><Icon /></div><p>{card.label}</p><strong>{card.value}</strong><span>{card.note}</span></article>; })}</section><div className="overview-columns"><section className="admin-panel"><div className="panel-title"><div><p>HIZLI ERİŞİM</p><h2>Katalog durumu</h2></div><button onClick={() => setTab("products")}>Ürünlere git <ArrowRight /></button></div><div className="overview-status"><div><span>Yayındaki ürünler</span><strong>{products.filter(item => item.is_active !== false).length}</strong></div><div><span>Öne çıkanlar</span><strong>{products.filter(item => item.is_featured).length}</strong></div><div><span>Taslaklar</span><strong>{products.filter(item => item.is_active === false).length}</strong></div></div></section><section className="admin-panel activity-panel"><div className="panel-title"><div><p>İŞLEM GEÇMİŞİ</p><h2>Son hareketler</h2></div></div>{activity.length ? <div className="activity-list">{activity.slice(0, 6).map(item => <div key={item.id}><CheckCircle2 /><span>{item.text}<small>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.at))}</small></span></div>)}</div> : <div className="admin-empty">Henüz kayıtlı bir işlem yok.</div>}</section></div></>;
}

function ProductTable({ products, categories, selected, setSelected, remove, edit, toggle }: { products: Product[]; categories: Category[]; selected: string[]; setSelected: (ids: string[]) => void; remove: (id: string) => void; edit: (product: Product) => void; toggle: (id: string, field: "is_active" | "is_featured") => void }) {
  const allSelected = products.length > 0 && products.every(item => selected.includes(item.id));
  return <section className="admin-panel"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th><input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? selected.filter(id => !products.some(item => item.id === id)) : [...new Set([...selected, ...products.map(item => item.id)])])} /></th><th>Ürün</th><th>Kategori</th><th>Stok</th><th>Fiyat</th><th>Yayın</th><th></th></tr></thead><tbody>{products.map(product => <tr key={product.id}><td><input type="checkbox" checked={selected.includes(product.id)} onChange={() => setSelected(selected.includes(product.id) ? selected.filter(id => id !== product.id) : [...selected, product.id])} /></td><td><div className="table-product"><div>{product.image_url && <Image src={product.image_url} alt="" fill sizes="48px" />}</div><span><strong>{product.name}</strong><small>{product.sku || product.slug}{product.is_featured && " · Öne çıkan"}</small></span></div></td><td>{categories.find(item => item.id === product.category_id)?.name || "—"}</td><td><span className={`status-dot status-${product.stock_status}`}>{product.stock_status === "in_stock" ? `Stokta${typeof product.stock_quantity === "number" ? ` · ${product.stock_quantity}` : ""}` : product.stock_status === "out_of_stock" ? "Tükendi" : "Sipariş üzerine"}</span></td><td><strong>{money.format(product.price)}</strong>{product.compare_at_price ? <small className="old-price">{money.format(product.compare_at_price)}</small> : null}</td><td><button className={`admin-switch ${product.is_active !== false ? "on" : ""}`} onClick={() => toggle(product.id, "is_active")} aria-label="Yayın durumunu değiştir"><span /></button></td><td><div className="table-actions"><button aria-label="Öne çıkar" className={product.is_featured ? "featured" : ""} onClick={() => toggle(product.id, "is_featured")}><Sparkles /></button><button aria-label="Düzenle" onClick={() => edit(product)}><Pencil /></button><button className="delete-button" aria-label="Sil" onClick={() => remove(product.id)}><Trash2 /></button></div></td></tr>)}</tbody></table></div>{!products.length && <div className="admin-empty">Bu filtrede ürün bulunamadı.</div>}</section>;
}

function CategoryManager({ categories, products, roots, edit, addChild, remove, move, toggle }: { categories: Category[]; products: Product[]; roots: Category[]; edit: (category: Category) => void; addChild: (id: string) => void; remove: (id: string) => void; move: (category: Category, direction: -1 | 1) => void; toggle: (id: string) => void }) {
  return <section className="category-admin-grid">{roots.map(category => <article key={category.id}><div className="category-card-top">{category.image_url ? <Image src={category.image_url} alt="" fill sizes="120px" /> : <FolderTree />}</div><div className="cat-admin-head"><div><small>{category.is_active === false ? "PASİF" : "ANA KATEGORİ"}</small><h2>{category.name}</h2><p>{category.description || "Kategori açıklaması eklenmedi."}</p></div><div className="card-actions"><button onClick={() => move(category, -1)} aria-label="Yukarı taşı"><ArrowUp /></button><button onClick={() => move(category, 1)} aria-label="Aşağı taşı"><ArrowDown /></button><button onClick={() => edit(category)} aria-label="Düzenle"><Pencil /></button><button onClick={() => remove(category.id)} aria-label="Sil"><Trash2 /></button></div></div><div className="category-meta"><span>{products.filter(item => item.category_id === category.id).length} ürün</span><label><input type="checkbox" checked={category.is_active !== false} onChange={() => toggle(category.id)} /> Yayında</label></div><div className="subcats"><span className="subcats-label">ALT KATEGORİLER</span>{categories.filter(item => item.parent_id === category.id).map(sub => <span key={sub.id}>{sub.name}<button onClick={() => edit(sub)}><Pencil /></button><button onClick={() => remove(sub.id)}><X /></button></span>)}<button onClick={() => addChild(category.id)}><Plus /> Alt kategori ekle</button></div></article>)}</section>;
}

function OrderManager({ orders, update, remove }: { orders: AdminOrder[]; update: (id: string, status: AdminOrder["status"]) => void; remove: (id: string) => void }) {
  return <section className="admin-panel"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Müşteri</th><th>Sipariş</th><th>Tarih</th><th>Tutar</th><th>Durum</th><th></th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td><strong>{order.customer}</strong><small className="cell-subtitle">{order.phone}</small></td><td>{order.summary}</td><td>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(order.created_at))}</td><td><strong>{money.format(order.total)}</strong></td><td><select value={order.status} onChange={event => update(order.id, event.target.value as AdminOrder["status"])}><option value="new">Yeni</option><option value="confirmed">Onaylandı</option><option value="preparing">Hazırlanıyor</option><option value="completed">Tamamlandı</option><option value="cancelled">İptal</option></select></td><td><button className="icon-danger" onClick={() => remove(order.id)}><Trash2 /></button></td></tr>)}</tbody></table></div>{!orders.length && <div className="admin-empty"><ClipboardList /><strong>Henüz sipariş kaydı yok</strong><span>WhatsApp’tan gelen siparişleri “Sipariş ekle” ile kaydedebilirsiniz.</span></div>}</section>;
}

function BannerManager({ banners, update, remove, save }: { banners: Banner[]; update: (id: string, field: keyof Banner, value: string | boolean | number) => void; remove: (id: string) => void; save: () => void }) {
  return <section className="banner-manager"><div className="banner-list">{banners.sort((a, b) => a.sort_order - b.sort_order).map((banner, index) => <article key={banner.id}><div className="banner-preview"><Image src={banner.image} alt="" fill sizes="240px" /><span>{index + 1}</span></div><div className="banner-fields"><div className="form-grid"><label>Üst başlık<input value={banner.eyebrow} onChange={event => update(banner.id, "eyebrow", event.target.value)} /></label><label>Sıra<input type="number" value={banner.sort_order} onChange={event => update(banner.id, "sort_order", Number(event.target.value))} /></label></div><label>Başlık<input value={banner.title} onChange={event => update(banner.id, "title", event.target.value)} /></label><label>Açıklama<textarea rows={2} value={banner.text} onChange={event => update(banner.id, "text", event.target.value)} /></label><div className="form-grid"><label>Buton metni<input value={banner.button} onChange={event => update(banner.id, "button", event.target.value)} /></label><label>Bağlantı<input value={banner.href} onChange={event => update(banner.id, "href", event.target.value)} /></label></div><label>Görsel URL<input value={banner.image} onChange={event => update(banner.id, "image", event.target.value)} /></label><div className="banner-actions"><label className="check-line"><input type="checkbox" checked={banner.is_active} onChange={event => update(banner.id, "is_active", event.target.checked)} /> Yayında</label><button className="icon-danger" onClick={() => remove(banner.id)}><Trash2 /> Sil</button></div></div></article>)}</div><div className="sticky-save"><span>Değişiklikler aynı tarayıcıdaki ana sayfaya uygulanır.</span><button className="admin-primary" onClick={save}>Bannerları kaydet</button></div></section>;
}

function SettingsPanel({ settings, save }: { settings: StoreSettings; save: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form className="settings-panel" onSubmit={save}><section className="settings-card"><div><span>İLETİŞİM</span><h2>Mağaza bilgileri</h2><p>Footer ve iletişim bağlantılarında gösterilir.</p></div><div className="settings-fields"><label>WhatsApp / telefon<input name="phone" defaultValue={settings.phone} /></label><label>Instagram kullanıcı adı<input name="instagram" defaultValue={settings.instagram} /></label><label className="full">Adres<textarea name="address" rows={2} defaultValue={settings.address} /></label><label className="full">Çalışma saatleri<input name="working_hours" defaultValue={settings.working_hours} /></label></div></section><section className="settings-card"><div><span>WEB SİTESİ</span><h2>Genel içerik ve SEO</h2><p>Tarayıcı ve arama sonuçlarında kullanılan metinler.</p></div><div className="settings-fields"><label className="full">Duyuru metni<input name="announcement" defaultValue={settings.announcement} /></label><label className="full">SEO başlığı<input name="seo_title" maxLength={60} defaultValue={settings.seo_title} /></label><label className="full">SEO açıklaması<textarea name="seo_description" maxLength={160} rows={3} defaultValue={settings.seo_description} /></label></div></section><div className="settings-submit"><button className="admin-primary">Ayarları kaydet</button></div></form>;
}

function SecurityPanel({ isDemo }: { isDemo: boolean }) {
  const checks = [{ label: "Oturum çerezi", ok: true, text: "HttpOnly ve SameSite Strict koruması aktif." }, { label: "Üretim şifresi", ok: false, text: "ADMIN_PASSWORD değerini güçlü bir şifreyle değiştirin." }, { label: "Oturum anahtarı", ok: false, text: "ADMIN_SESSION_SECRET için en az 32 karakter kullanın." }, { label: "Veri bağlantısı", ok: !isDemo, text: isDemo ? "Panel şu anda yerel demo depolamasını kullanıyor." : "Supabase yönetim bağlantısı aktif." }];
  return <div className="security-grid"><section className="settings-card security-card"><div><span>ERİŞİM</span><h2>Yönetim güvenliği</h2><p>Şifre bilgileri Vercel ortam değişkenlerinden yönetilir.</p></div><div className="security-checks">{checks.map(check => <div key={check.label} className={check.ok ? "ok" : "warn"}><ShieldCheck /><span><strong>{check.label}</strong><small>{check.text}</small></span></div>)}</div></section><section className="security-note"><strong>Yayın öncesi yapılacaklar</strong><ol><li>ADMIN_PASSWORD değerini değiştirin.</li><li>ADMIN_SESSION_SECRET için rastgele güçlü bir anahtar oluşturun.</li><li>Vercel ortam değişkenlerini Production kapsamına ekleyin.</li><li>Demo depolamasını Supabase ile değiştirin.</li></ol><p>Vercel ortam değişkenleri çalışma anında panelden değiştirilemez; bu güvenlik açısından doğru davranıştır.</p></section></div>;
}

function AdminModal({ modal, editing, categories, roots, previews, setPreviews, addImages, close, saveCatalog, saveOrder, saving }: { modal: Exclude<Modal, null>; editing: Product | Category | null; categories: Category[]; roots: Category[]; previews: string[]; setPreviews: (images: string[]) => void; addImages: (files: FileList | null, limit?: number) => void; close: () => void; saveCatalog: (event: FormEvent<HTMLFormElement>) => void; saveOrder: (event: FormEvent<HTMLFormElement>) => void; saving: boolean }) {
  const product = modal === "product" && editing && "price" in editing ? editing : null;
  const category = modal === "category" && editing && !("price" in editing) ? editing : null;
  return <div className="admin-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && close()}><div className="admin-modal"><div className="modal-head"><div><p>{editing ? "KAYDI DÜZENLE" : "YENİ KAYIT"}</p><h2>{modal === "product" ? editing ? "Ürünü düzenle" : "Yeni ürün" : modal === "category" ? editing ? "Kategoriyi düzenle" : "Yeni kategori" : "Yeni sipariş"}</h2></div><button onClick={close}><X /></button></div>{modal === "order" ? <form onSubmit={saveOrder}><div className="form-grid"><label>Müşteri adı<input name="customer" required /></label><label>Telefon<input name="phone" required /></label></div><label>Sipariş özeti<textarea name="summary" rows={3} required /></label><label>Toplam tutar (₺)<input name="total" type="number" min="0" required /></label><button className="admin-primary form-submit">Siparişi kaydet</button></form> : <form onSubmit={saveCatalog}><div className="form-grid"><label>Ad<input name="name" required defaultValue={editing?.name || ""} /></label>{modal === "product" && <label>Ürün kodu / SKU<input name="sku" defaultValue={product?.sku || ""} placeholder="DKR-001" /></label>}</div><label>Açıklama<textarea name="description" rows={3} defaultValue={editing?.description || ""} /></label>{modal === "product" ? <><div className="form-grid product-numbers"><label>Satış fiyatı (₺)<input name="price" type="number" min="0" required defaultValue={product?.price || ""} /></label><label>Eski fiyat (₺)<input name="compare_at_price" type="number" min="0" defaultValue={product?.compare_at_price || ""} /></label><label>Stok adedi<input name="stock_quantity" type="number" min="0" defaultValue={product?.stock_quantity || 0} /></label></div><div className="form-grid"><label>Kategori<select name="category_id" required defaultValue={product?.category_id || ""}><option value="">Kategori seçin</option>{categories.map(item => <option value={item.id} key={item.id}>{item.parent_id ? "↳ " : ""}{item.name}</option>)}</select></label><label>Stok durumu<select name="stock_status" defaultValue={product?.stock_status || "made_to_order"}><option value="made_to_order">Sipariş üzerine</option><option value="in_stock">Stokta</option><option value="out_of_stock">Tükendi</option></select></label></div><div className="form-grid check-grid"><label className="check-line"><input name="is_active" type="checkbox" defaultChecked={product?.is_active !== false} /> Yayında</label><label className="check-line"><input name="is_featured" type="checkbox" defaultChecked={product?.is_featured} /> Öne çıkan ürün</label></div><div className="form-grid seo-grid"><label>SEO başlığı<input name="seo_title" maxLength={60} defaultValue={product?.seo_title || ""} /></label><label>SEO açıklaması<input name="seo_description" maxLength={160} defaultValue={product?.seo_description || ""} /></label></div></> : <><div className="form-grid"><label>Üst kategori<select name="parent_id" defaultValue={category?.parent_id || ""}><option value="">Ana kategori</option>{roots.filter(item => item.id !== editing?.id).map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Sıralama<input name="sort_order" type="number" defaultValue={category?.sort_order || 0} /></label></div><label className="check-line"><input name="is_active" type="checkbox" defaultChecked={category?.is_active !== false} /> Kategori yayında</label></>}<div className="media-section"><label className="image-url-input">Görsel URL<input name="image_url" type="url" defaultValue={editing?.image_url || ""} placeholder="https://..." /></label><label className="local-image-picker"><ImagePlus /><span>Bilgisayardan görsel seçin</span><small>JPG, PNG veya WebP · en fazla 5 MB</small><input type="file" accept="image/*" multiple={modal === "product"} onChange={event => addImages(event.target.files, modal === "product" ? 6 : 1)} /></label>{previews.length > 0 && <div className="image-preview-grid">{previews.map((src, index) => <div key={`${src.slice(0, 24)}-${index}`}><img src={src} alt="" /><button type="button" onClick={() => setPreviews(previews.filter((_, imageIndex) => imageIndex !== index))}><X /></button>{index === 0 && <span>Kapak</span>}</div>)}</div>}</div><button disabled={saving} className="admin-primary form-submit">{saving ? "Kaydediliyor…" : editing ? "Değişiklikleri kaydet" : "Kaydet"}</button></form>}</div></div>;
}
