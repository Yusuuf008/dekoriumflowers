import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import { ProductDetail } from "@/components/product-detail";

export const revalidate = 60;
export async function generateStaticParams() { const { products } = await getCatalog(); return products.map(p => ({ slug: p.slug })); }
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const catalog = await getCatalog(); const product = catalog.products.find(p => p.slug === slug);
  if (!product) notFound();
  const category = catalog.categories.find(c => c.id === product.category_id);
  const related = catalog.products.filter(p => p.id !== product.id && p.category_id === product.category_id).slice(0,4);
  return <ProductDetail product={product} category={category} categories={catalog.categories} related={related.length ? related : catalog.products.filter(p=>p.id!==product.id).slice(0,4)} />;
}
