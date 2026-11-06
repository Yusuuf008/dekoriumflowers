import { getCatalog } from "@/lib/catalog";
import { LegalPage } from "@/components/legal-page";

export default async function TermsPage() {
  const { categories } = await getCatalog();
  return <LegalPage categories={categories} eyebrow="KULLANIM KOŞULLARI" title="Keyifli bir alışveriş için." intro="Bu siteyi kullanarak aşağıdaki koşulları kabul etmiş olursunuz. Her siparişi taze çiçeklerle, özenle hazırlamak için çalışıyoruz." sections={[
    { title: "Sipariş süreci", paragraphs: ["Sepetinize eklediğiniz ürünler için WhatsApp üzerinden sipariş talebi oluşturabilirsiniz. Sipariş; ürün uygunluğu, teslimat adresi ve detaylar birlikte teyit edildikten sonra kesinleşir.", "Mevsimsel ürünlerde çiçek çeşidi veya tonunda küçük farklılıklar olabilir. Tasarımın genel renk paleti ve değeri korunarak en taze alternatifler kullanılır."] },
    { title: "Fiyatlandırma ve ödeme", paragraphs: ["Sitede görünen fiyatlar Türk lirası cinsindendir. Teslimat, özel istekler veya ek ürünler için oluşabilecek farklar sipariş onayında ayrıca paylaşılır."] },
    { title: "Teslimat", paragraphs: ["Teslimat zamanı ve uygunluğu, teslimat bölgesine göre sipariş teyidi sırasında netleştirilir. Alıcının iletişim ve adres bilgilerinin doğru paylaşılması müşterinin sorumluluğundadır."] },
    { title: "İçerik kullanımı", paragraphs: ["Sitedeki metinler, görseller ve marka unsurları Dekorium Flowers'a aittir. Yazılı izin olmadan kopyalanamaz, çoğaltılamaz veya başka bir amaçla kullanılamaz."] },
  ]}/>;
}
