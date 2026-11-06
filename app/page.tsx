import { getCatalog } from "@/lib/catalog";
import { Storefront } from "@/components/storefront";

export const revalidate = 60;

export default async function Home() {
  const catalog = await getCatalog();
  return <Storefront initialCategories={catalog.categories} initialProducts={catalog.products} />;
}
