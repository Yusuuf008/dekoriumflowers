import { createHmac, timingSafeEqual } from "crypto";

const secret = () => process.env.ADMIN_SESSION_SECRET || "development-only-change-me";
export function makeSession() {
  const expires = Date.now() + 1000 * 60 * 60 * 12;
  const payload = String(expires);
  const signature = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}
export function verifySession(value?: string) {
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  const expected = createHmac("sha256", secret()).update(expires).digest("hex");
  try { return timingSafeEqual(Buffer.from(signature), Buffer.from(expected)); } catch { return false; }
}
