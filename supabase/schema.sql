-- Dekorium Flowers — Supabase SQL Editor'de tek seferde çalıştırın.
-- Tablo yapısı, güvenlik, görsel depolama alanı ve başlangıç kataloğu kurulur.

create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  parent_id uuid references public.categories(id) on delete set null,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2) check (compare_at_price is null or compare_at_price >= price),
  image_url text not null,
  image_urls text[] not null default '{}',
  category_id uuid not null references public.categories(id) on delete restrict,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  stock_status text not null default 'made_to_order' check (stock_status in ('in_stock', 'made_to_order', 'out_of_stock')),
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  sku text unique,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Var olan, daha eski bir kurulum için uyumluluk alanları.
alter table public.categories add column if not exists is_active boolean not null default true;
alter table public.categories add column if not exists updated_at timestamptz not null default now();
alter table public.products add column if not exists image_urls text[] not null default '{}';
alter table public.products add column if not exists stock_quantity integer;
alter table public.products add column if not exists sku text;
alter table public.products add column if not exists seo_title text;
alter table public.products add column if not exists seo_description text;

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();

create index if not exists categories_parent_id_idx on public.categories(parent_id);
create index if not exists categories_sort_order_idx on public.categories(sort_order);
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_active_created_at_idx on public.products(is_active, created_at desc);

alter table public.categories enable row level security;
alter table public.products enable row level security;
drop policy if exists "Kategoriler herkese açık" on public.categories;
create policy "Kategoriler herkese açık" on public.categories for select to anon, authenticated using (is_active = true);
drop policy if exists "Aktif ürünler herkese açık" on public.products;
create policy "Aktif ürünler herkese açık" on public.products for select to anon, authenticated using (is_active = true);

-- Yönetim paneli sunucudaki SUPABASE_SERVICE_ROLE_KEY ile yazdığı için anon/authenticated yazma politikası yoktur.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Ürün görselleri herkese açık" on storage.objects;
create policy "Ürün görselleri herkese açık" on storage.objects for select to public using (bucket_id = 'product-images');

-- Ana ve alt kategoriler
insert into public.categories (id, name, slug, description, image_url, sort_order, is_active) values
('10000000-0000-4000-8000-000000000001','Buketler','buketler','Taze çiçeklerle hazırlanan zarif buketler','https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=85',1,true),
('10000000-0000-4000-8000-000000000002','Aranjmanlar','aranjmanlar','Masa ve yaşam alanları için çiçek tasarımları','https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=1200&q=85',2,true),
('10000000-0000-4000-8000-000000000003','Saksı Bitkileri','saksi-bitkileri','Uzun ömürlü yeşil ve çiçekli seçimler','https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=85',3,true),
('10000000-0000-4000-8000-000000000004','Özel Günler','ozel-gunler','Anlamı olan günler için özenli hediyeler','https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=85',4,true)
on conflict (slug) do update set name=excluded.name,description=excluded.description,image_url=excluded.image_url,sort_order=excluded.sort_order,is_active=excluded.is_active;

insert into public.categories (id,name,slug,parent_id,sort_order,is_active) values
('20000000-0000-4000-8000-000000000001','Gül Buketleri','gul-buketleri','10000000-0000-4000-8000-000000000001',1,true),
('20000000-0000-4000-8000-000000000002','Mevsim Buketleri','mevsim-buketleri','10000000-0000-4000-8000-000000000001',2,true),
('20000000-0000-4000-8000-000000000003','Kutuda Çiçek','kutuda-cicek','10000000-0000-4000-8000-000000000002',1,true),
('20000000-0000-4000-8000-000000000004','Vazoda Çiçek','vazoda-cicek','10000000-0000-4000-8000-000000000002',2,true),
('20000000-0000-4000-8000-000000000005','Orkideler','orkideler','10000000-0000-4000-8000-000000000003',1,true),
('20000000-0000-4000-8000-000000000006','Yeşil Bitkiler','yesil-bitkiler','10000000-0000-4000-8000-000000000003',2,true),
('20000000-0000-4000-8000-000000000007','Doğum Günü','dogum-gunu','10000000-0000-4000-8000-000000000004',1,true),
('20000000-0000-4000-8000-000000000008','Yıl Dönümü','yil-donumu','10000000-0000-4000-8000-000000000004',2,true),
('20000000-0000-4000-8000-000000000009','Geçmiş Olsun','gecmis-olsun','10000000-0000-4000-8000-000000000004',3,true)
on conflict (slug) do update set name=excluded.name,parent_id=excluded.parent_id,sort_order=excluded.sort_order,is_active=excluded.is_active;

-- Başlangıç ürünleri (yönetim panelinden dilediğiniz gibi güncelleyebilirsiniz)
insert into public.products (id,name,slug,description,price,compare_at_price,image_url,category_id,is_featured,is_active,stock_status,sku) values
('30000000-0000-4000-8000-000000000001','Rose Noir','rose-noir','Kırmızı güller, okaliptüs ve zarif dokunuşlarla hazırlanan etkileyici buket.',1890,null,'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=85','20000000-0000-4000-8000-000000000001',true,true,'made_to_order','DF-RN-001'),
('30000000-0000-4000-8000-000000000002','Pudra Gül Buketi','pudra-gul-buketi','Pudra tonlarında güllerle hazırlanmış yumuşak ve romantik bir seçki.',1690,1890,'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=85','20000000-0000-4000-8000-000000000001',true,true,'made_to_order','DF-PG-002'),
('30000000-0000-4000-8000-000000000003','Bahar Esintisi','bahar-esintisi','Mevsimin canlı çiçeklerinden hazırlanan ferah ve neşeli buket.',1390,null,'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=85','20000000-0000-4000-8000-000000000002',true,true,'made_to_order','DF-BE-003'),
('30000000-0000-4000-8000-000000000004','Beyaz Zambak','beyaz-zambak','Beyaz zambaklar ve mevsim yeşillikleriyle sakin, temiz bir buket.',1590,null,'https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=1200&q=85','20000000-0000-4000-8000-000000000002',false,true,'made_to_order','DF-BZ-004'),
('30000000-0000-4000-8000-000000000005','İmza Gül Kutusu','imza-gul-kutusu','Dekorium kutusunda premium güllerden hazırlanan şık hediye tasarımı.',2290,null,'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=85','20000000-0000-4000-8000-000000000003',true,true,'made_to_order','DF-IG-005'),
('30000000-0000-4000-8000-000000000006','Şampanya Kutusu','sampanya-kutusu','Krem ve şeftali tonlarında çiçeklerle hazırlanmış zarif kutu aranjmanı.',2490,null,'https://images.unsplash.com/photo-1469259943454-aa100abba749?auto=format&fit=crop&w=1200&q=85','20000000-0000-4000-8000-000000000003',false,true,'made_to_order','DF-SK-006'),
('30000000-0000-4000-8000-000000000007','Vazo Bahçesi','vazo-bahcesi','Cam vazoda mevsim çiçekleriyle hazırlanan ev sıcaklığında bir aranjman.',1790,null,'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?auto=format&fit=crop&w=1200&q=85','20000000-0000-4000-8000-000000000004',false,true,'made_to_order','DF-VB-007'),
('30000000-0000-4000-8000-000000000008','Çift Dal Beyaz Orkide','cift-dal-beyaz-orkide','Seramik saksısında çift dallı, uzun ömürlü beyaz orkide.',2190,null,'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=85','20000000-0000-4000-8000-000000000005',true,true,'in_stock','DF-BO-008'),
('30000000-0000-4000-8000-000000000009','Mini Orkide','mini-orkide','Kompakt formda, bulunduğu her köşeye zarafet katan orkide.',1290,null,'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=1200&q=85','20000000-0000-4000-8000-000000000005',false,true,'in_stock','DF-MO-009'),
('30000000-0000-4000-8000-000000000010','Barış Çiçeği','baris-cicegi','Kolay bakımı ve güçlü yeşil yapraklarıyla zamansız bir saksı bitkisi.',990,null,'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=85','20000000-0000-4000-8000-000000000006',false,true,'in_stock','DF-BC-010'),
('30000000-0000-4000-8000-000000000011','Doğum Günü Sevinci','dogum-gunu-sevinci','Renkli mevsim çiçekleriyle kutlamalara neşe katan tasarım.',1690,null,'https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=1200&q=85','20000000-0000-4000-8000-000000000007',false,true,'made_to_order','DF-DS-011'),
('30000000-0000-4000-8000-000000000012','Yıldönümü Rüyası','yildonumu-ruyasi','Kırmızı ve pembe güllerin zamansız birlikteliğiyle hazırlanmış özel buket.',2790,null,'https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=1200&q=85','20000000-0000-4000-8000-000000000008',false,true,'made_to_order','DF-YR-012'),
('30000000-0000-4000-8000-000000000013','Geçmiş Olsun Aranjmanı','gecmis-olsun-aranjmani','Moral veren açık tonlarıyla geçmiş olsun dileklerinize eşlik eden aranjman.',1490,null,'https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?auto=format&fit=crop&w=1200&q=85','20000000-0000-4000-8000-000000000009',false,true,'made_to_order','DF-GO-013')
on conflict (slug) do update set
name=excluded.name,description=excluded.description,price=excluded.price,compare_at_price=excluded.compare_at_price,image_url=excluded.image_url,category_id=excluded.category_id,is_featured=excluded.is_featured,is_active=excluded.is_active,stock_status=excluded.stock_status,sku=excluded.sku;
