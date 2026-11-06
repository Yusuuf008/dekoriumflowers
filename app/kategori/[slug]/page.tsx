import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import { CatalogPage } from "@/components/catalog-page";
export const revalidate=60;
export default async function CategoryPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const catalog=await getCatalog();if(slug==="tum-urunler")return <CatalogPage categories={catalog.categories} products={catalog.products} title="Tüm Ürünler" description="Dekorium'un taze çiçeklerden hazırlanan tüm buket, aranjman ve özel gün tasarımlarını keşfedin."/>;const category=catalog.categories.find(c=>c.slug===slug);if(!category)notFound();const ids=[category.id,...catalog.categories.filter(c=>c.parent_id===category.id).map(c=>c.id)];const products=catalog.products.filter(p=>ids.includes(p.category_id));return <CatalogPage categories={catalog.categories} products={products} title={category.name} description={category.description||"Özenle hazırlanan Dekorium seçkisini keşfedin."}/>}
