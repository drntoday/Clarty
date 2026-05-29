/**
 * ClarityCommerce Shared Products Store
 * Provides in-memory state management for product listings in the Next.js backend.
 * Built for claritycommerce.cc by nitishkumar.pro.
 */

export interface Product {
  id: string;
  name: string;
  platform: string;
  price: number;
  currency: string;
  seoScore: number;
  stock: number;
  sales30d: number;
  rating: number;
  imageUrl: string;
  description: string;
  keywords: string[];
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-earbuds",
    name: "SonicGlide Earbuds Pro",
    platform: "Amazon",
    price: 89.0,
    currency: "USD",
    seoScore: 68,
    stock: 142,
    sales30d: 540,
    rating: 4.1,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Experience absolute high-fidelity sounds with active audio filtering, durable multi-hour runtime casing, and quick-pair bluetooth mechanics. Built for pure comfort.",
    keywords: ["earbuds", "wireless bluetooth headphones", "noise cancelling earbuds", "earphones"]
  },
  {
    id: "prod-mug",
    name: "EcoMug Double-Wall Insulated",
    platform: "Shopify",
    price: 24.99,
    currency: "USD",
    seoScore: 84,
    stock: 350,
    sales30d: 120,
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Premium stainless steel insulated mug designed with solid dual walls to protect cold beverages up to 24 hours and hot coffee for 12 hours. Zero sweat, spill proof.",
    keywords: ["double wall mug", "insulated tumbler", "stainless steel coffee cup", "travel travel mug"]
  },
  {
    id: "prod-sheets",
    name: "Bamboo Luxury Comfort Sheets",
    platform: "WooCommerce",
    price: 119.0,
    currency: "USD",
    seoScore: 45,
    stock: 58,
    sales30d: 34,
    rating: 3.9,
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "These sheets are crafted of 100% genuine sustainable viscose fiber from real bamboo stalks. Incredibly silky surface, hypo-allergenic material, skin cooling and safe touch.",
    keywords: ["bamboo sheets", "luxury bed sheets", "cooling viscose sheets", "bamboo bedding pack"]
  },
  {
    id: "prod-keyboard",
    name: "Luminous Mechanical Keyboard G-88",
    platform: "Taobao",
    price: 349.00,
    currency: "CNY",
    seoScore: 74,
    stock: 12,
    sales30d: 98,
    rating: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Responsive red linear mechanical switches paired with solid double-shot keycaps. Beautiful multi-zone colorful background backlights, premium metal shell body.",
    keywords: ["mechanical keyboard", "custom gaming keyboard", "red switch keyboard", "backlit keyboard custom"]
  },
  {
    id: "prod-cardholder",
    name: "Minimalist Leather Cardholder",
    platform: "Etsy",
    price: 35.0,
    currency: "USD",
    seoScore: 91,
    stock: 80,
    sales30d: 220,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1627124118123-27d1959b37d2?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Sleek and slim credit card wallet handcrafted from direct authentic full-grain calf hide. Fits up to six modern credit cards plus folding money compartment safely.",
    keywords: ["leather card holder", "minimalist wallet", "front pocket wallet", "rfid blocking cardholder"]
  }
];

// Global in-memory reference to withstand standard serverless module lifecycles within current sandbox processes
let currentProducts: Product[] = [...INITIAL_PRODUCTS];

export function getProducts(): Product[] {
  return currentProducts;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const productIndex = currentProducts.findIndex((p) => p.id === id);
  if (productIndex === -1) return null;

  const current = currentProducts[productIndex];
  const oldSeo = current.seoScore;
  const description = updates.description !== undefined ? updates.description : current.description;
  const isBetter = description && description.includes("【Enhanced Premium Build】");
  const computedSeo = isBetter ? Math.min(94, oldSeo + 15) : oldSeo;

  currentProducts[productIndex] = {
    ...current,
    ...updates,
    seoScore: computedSeo,
  };

  return currentProducts[productIndex];
}

export function resetProducts(): Product[] {
  currentProducts = INITIAL_PRODUCTS.map(p => ({ ...p }));
  return currentProducts;
}
