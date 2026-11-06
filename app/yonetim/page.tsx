import { cookies } from "next/headers";
import { verifySession } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin-login";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const loggedIn = verifySession((await cookies()).get("dekorium_admin")?.value);
  if (!loggedIn) return <AdminLogin />;
  const catalog = await getCatalog();
  return <AdminDashboard initialProducts={catalog.products} initialCategories={catalog.categories} isDemo={catalog.isDemo} />;
}
