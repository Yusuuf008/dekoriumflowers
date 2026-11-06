# Dekorium Flowers

Kayseri merkezli çiçekçi için Next.js, Supabase ve WhatsApp sipariş akışlı e-ticaret sitesi.

## Yerel kurulum

```bash
npm install
cp .env.example .env.local
npm run dev
```

Mağaza: `http://localhost:3000`
Yönetim paneli: `http://localhost:3000/yonetim`

Supabase kurulmadan site örnek katalogla demo modunda çalışır. Gerçek veri için Supabase Dashboard → **SQL Editor** bölümünde [supabase/schema.sql](supabase/schema.sql) dosyasının tamamını çalıştırın. Dosya tablo yapısını, güvenlik kurallarını, `product-images` görsel alanını, ana/alt kategorileri ve başlangıç ürünlerini tek seferde oluşturur.

## Vercel

Projeyi Vercel'e aktarın, `.env.example` içindeki değişkenleri Project Settings → Environment Variables alanına ekleyin ve deploy edin. `SUPABASE_SERVICE_ROLE_KEY` kesinlikle `NEXT_PUBLIC_` öneki almamalıdır.

WhatsApp numarası ülke koduyla, `+` işareti ve boşluk olmadan yazılmalıdır: `905xxxxxxxxx`.
