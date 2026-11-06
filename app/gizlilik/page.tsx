import { getCatalog } from "@/lib/catalog";
import { LegalPage } from "@/components/legal-page";

export default async function PrivacyPage() {
  const { categories } = await getCatalog();
  return <LegalPage categories={categories} eyebrow="GİZLİLİK VE KVKK" title="Gizliliğiniz bizim için önemli." intro="Dekorium Flowers olarak kişisel verilerinizi özenle korur; yalnızca siparişinizi doğru şekilde hazırlamak ve size ulaşmak için kullanırız." sections={[
    { title: "Topladığımız bilgiler", paragraphs: ["Sipariş, iletişim ve teslimat sürecinde adınız, telefon numaranız, teslimat adresiniz ile kart notu gibi bilgileri paylaşabilirsiniz.", "Bu bilgiler yalnızca siparişin hazırlanması, teyidi ve teslimatı için gerekli olduğu ölçüde işlenir."] },
    { title: "Bilgileri nasıl kullanırız?", paragraphs: ["Bilgilerinizi siparişinizle ilgili sizinle WhatsApp üzerinden iletişim kurmak, teslimatı planlamak ve talebinizi tamamlamak için kullanırız.", "Açık onayınız olmadan bilgilerinizi pazarlama amaçlı kullanmaz, satmaz veya üçüncü kişilerle paylaşmayız."] },
    { title: "Saklama ve güvenlik", paragraphs: ["Kişisel verilerinize yalnızca görevli kişiler erişebilir. Bilgileri, yasal yükümlülüklerimiz ve hizmetin gerektirdiği süre boyunca güvenli biçimde saklarız."] },
    { title: "Haklarınız", paragraphs: ["Kişisel verileriniz hakkında bilgi talep edebilir; güncellenmesini, silinmesini veya işlenmesinin sınırlandırılmasını isteyebilirsiniz. Bu konudaki talepleriniz için bizimle iletişime geçebilirsiniz."] },
  ]}/>;
}
