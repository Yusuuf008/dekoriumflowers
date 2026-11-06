export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  image_url: string;
  image_urls?: string[];
  category_id: string;
  is_featured?: boolean;
  is_active?: boolean;
  stock_status?: "in_stock" | "made_to_order" | "out_of_stock";
  stock_quantity?: number;
  sku?: string;
  seo_title?: string;
  seo_description?: string;
};

export type CartItem = Product & { quantity: number };

export type Banner = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  href: string;
  button: string;
  is_active: boolean;
  sort_order: number;
};

export type StoreSettings = {
  phone: string;
  address: string;
  instagram: string;
  working_hours: string;
  announcement: string;
  seo_title: string;
  seo_description: string;
};

export type AdminOrder = {
  id: string;
  customer: string;
  phone: string;
  summary: string;
  total: number;
  status: "new" | "confirmed" | "preparing" | "completed" | "cancelled";
  created_at: string;
};
