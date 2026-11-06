import { categories as demoCategories, products as demoProducts } from "./demo-data";
import { getSupabase } from "./supabase";

export async function getCatalog() {
  const supabase = getSupabase();
  if (!supabase) return { categories: demoCategories, products: demoProducts, isDemo: true };
  try {
    const [{ data: categories, error: catError }, { data: products, error: productError }] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }),
    ]);

    if (catError || productError) throw new Error("Supabase catalog request failed");
    return { categories: categories ?? demoCategories, products: products ?? demoProducts, isDemo: false };
  } catch {
    return { categories: demoCategories, products: demoProducts, isDemo: true };
  }
}
