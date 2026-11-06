"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";

export function AdminLogin() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.get("password") }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Giriş bilgileri doğrulanamadı.");
        return;
      }
      location.reload();
    } catch {
      setError("Sunucuya ulaşılamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-login-intro">
          <div className="admin-login-icon"><LockKeyhole /></div>
          <div>
            <p className="admin-login-eyebrow">GÜVENLİ GİRİŞ</p>
            <h1 id="admin-login-title">Yönetim paneli</h1>
            <p className="admin-login-copy">Yönetim alanına erişmek için şifrenizi girin.</p>
          </div>
        </div>
        <form onSubmit={submit}>
          <label><span>Şifre</span><input name="password" type="password" required autoComplete="current-password" placeholder="Şifrenizi girin" /></label>
          {error && <p className="admin-login-error" role="alert">{error}</p>}
          <button type="submit" disabled={loading}><span>{loading ? "Giriş yapılıyor…" : "Giriş yap"}</span>{!loading && <ArrowRight />}</button>
        </form>
      </section>
    </main>
  );
}
