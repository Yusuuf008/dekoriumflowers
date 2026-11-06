import { getCatalog } from "@/lib/catalog";
import { CatalogPage } from "@/components/catalog-page";
export const dynamic="force-dynamic";
export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){const {q=""}=await searchParams;const catalog=await getCatalog();const normalized=q.toLocaleLowerCase("tr");const products=catalog.products.filter(p=>`${p.name} ${p.description}`.toLocaleLowerCase("tr").includes(normalized));return <CatalogPage categories={catalog.categories} products={products} title={q?`“${q}” araması`:"Arama"} description={q?`${products.length} ürün bulundu.`:"Aradığınız çiçeği yazın."}/>}
