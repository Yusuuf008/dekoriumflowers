import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() || "";
  if (query.length < 2) return NextResponse.json([]);
  const { products } = await getCatalog();
  const normalize = (value: string) => value.toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalized = normalize(query);
  return NextResponse.json(products.filter((product) => normalize(`${product.name} ${product.description}`).includes(normalized)).slice(0, 6).map((product) => ({ id: product.id, name: product.name, slug: product.slug, price: product.price, image_url: product.image_url })));
}
