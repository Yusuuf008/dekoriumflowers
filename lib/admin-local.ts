import { AdminOrder, Banner, StoreSettings } from "./types";

export const ADMIN_STORAGE = {
  products: "dekorium-admin-products-v2",
  categories: "dekorium-admin-categories-v2",
  banners: "dekorium-admin-banners-v2",
  settings: "dekorium-admin-settings",
  orders: "dekorium-admin-orders",
  activity: "dekorium-admin-activity",
} as const;

export const defaultBanners: Banner[] = [
  { id: "banner-1", eyebrow: "KAYSERİ’DE ÖZENLE HAZIRLANIR", title: "Çiçekler\nkonuşsun.", text: "Taze çiçeklerle, söylemek istediklerinizi zarifçe anlatan buketler.", image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=2400&q=92", href: "/kategori/buketler", button: "Buketleri keşfet", is_active: true, sort_order: 1 },
  { id: "banner-2", eyebrow: "KÜÇÜK BİR JEST, BÜYÜK BİR HİS", title: "Her an için\nözenle.", text: "Kutuda ve vazoda; özel günlerinize eşlik eden çiçek tasarımları.", image: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=2400&q=92", href: "/kategori/aranjmanlar", button: "Aranjmanları keşfet", is_active: true, sort_order: 2 },
  { id: "banner-3", eyebrow: "UZUN ÖMÜRLÜ BİR HEDİYE", title: "Yaşayan bir\nhediye.", text: "Orkideler ve seçkin saksı bitkileriyle sakin, kalıcı bir dokunuş.", image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=2400&q=92", href: "/kategori/saksi-bitkileri", button: "Saksı bitkilerini keşfet", is_active: true, sort_order: 3 },
];

export const defaultStoreSettings: StoreSettings = {
  phone: "0541 601 86 27",
  address: "Gülük Mahallesi, Ünönü Bulvarı, Fatih Çarşısı No: 20/B, Kayseri",
  instagram: "dekorium_flowers",
  working_hours: "Pazartesi – Cumartesi · 09.00 – 19.00",
  announcement: "Kayseri’de aynı gün teslimat için bize ulaşın",
  seo_title: "Dekorium Flowers | Kayseri Çiçek Siparişi",
  seo_description: "Kayseri’de özenle hazırlanan buket, aranjman ve orkide seçeneklerini keşfedin.",
};

export const defaultOrders: AdminOrder[] = [];

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(key: string, value: T) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
}
