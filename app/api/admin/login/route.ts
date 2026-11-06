import { NextResponse } from "next/server";
import { makeSession } from "@/lib/admin-auth";

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientId = forwarded || "local";
  const now = Date.now();
  const current = attempts.get(clientId);
  if (current && current.resetAt > now && current.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Çok fazla başarısız deneme. 15 dakika sonra tekrar deneyin." }, { status: 429 });
  }
  if (current && current.resetAt <= now) attempts.delete(clientId);

  const { email, password } = await request.json();
  const validEmail = process.env.ADMIN_EMAIL || "admin@dekoriumflowers.com";
  const validPassword = process.env.ADMIN_PASSWORD || "admin123";
  if (email !== validEmail || password !== validPassword) {
    const failure = attempts.get(clientId);
    attempts.set(clientId, { count: (failure?.count || 0) + 1, resetAt: failure?.resetAt || now + WINDOW_MS });
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  }
  attempts.delete(clientId);
  const response = NextResponse.json({ ok: true });
  response.cookies.set("dekorium_admin", makeSession(), { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
  return response;
}
