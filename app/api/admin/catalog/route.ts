import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/admin-auth";
import { getAdminSupabase } from "@/lib/admin-db";

async function authorized() { return verifySession((await cookies()).get("dekorium_admin")?.value); }
export async function POST(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const db = getAdminSupabase();
  if (!db) return NextResponse.json({ error: "Supabase bağlantısı henüz yapılandırılmadı." }, { status: 503 });
  const { type, data } = await request.json();
  if (!['products','categories'].includes(type)) return NextResponse.json({ error: "Geçersiz kayıt türü" }, { status: 400 });
  const { data: result, error } = await db.from(type).upsert(data).select().single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(result);
}
export async function DELETE(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const db = getAdminSupabase();
  if (!db) return NextResponse.json({ error: "Supabase bağlantısı henüz yapılandırılmadı." }, { status: 503 });
  const { searchParams } = new URL(request.url); const type = searchParams.get("type"); const id = searchParams.get("id");
  if (!type || !id || !['products','categories'].includes(type)) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  const { error } = await db.from(type).delete().eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}
