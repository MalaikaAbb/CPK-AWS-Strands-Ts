/**
 * Repo-authored — NOT from the docs.
 *
 * The Catalogs page's `ProductCard` tells the model to copy every value "from a
 * product of a tool result", and the Surfaces page asks for "cheap running
 * shoes". No Strands TypeScript page publishes a tool that returns products,
 * so this is the smallest one that gives the model something to copy
 * (shoes for the Surfaces prompts, mugs for the Standard catalog ones):
 * a fixed list, filtered by a free-text query and an optional price cap.
 *
 * The fields match the published `ProductCard` props exactly (`name`, `price`,
 * `imageUrl`), plus the `productId` the State and actions page's cards take.
 * Images are fixed Unsplash product photos (shoes, socks and mugs),
 * picked by hand so each card shows what it names.
 */

import { tool } from "@strands-agents/sdk";
import { z } from "zod";

interface ProductRecord {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  tags: string[];
}

const PRODUCTS: ProductRecord[] = [
  { productId: "p1", name: "Trail Runner", price: 120, imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=320&h=200&fit=crop", tags: ["running", "shoes", "trail"] },
  { productId: "p2", name: "City Sneaker", price: 85, imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=320&h=200&fit=crop", tags: ["shoes", "casual"] },
  { productId: "p3", name: "Track Spike", price: 140, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=320&h=200&fit=crop", tags: ["running", "shoes", "track"] },
  { productId: "p4", name: "Road Racer Lite", price: 59, imageUrl: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=320&h=200&fit=crop", tags: ["running", "shoes", "road", "cheap"] },
  { productId: "p5", name: "Everyday Jogger", price: 45, imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=320&h=200&fit=crop", tags: ["running", "shoes", "cheap"] },
  { productId: "p6", name: "Wool Running Socks", price: 18, imageUrl: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=320&h=200&fit=crop", tags: ["running", "socks", "accessories"] },
  { productId: "p7", name: "Classic White Mug", price: 40, imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=320&h=200&fit=crop", tags: ["mug", "coffee", "cup", "kitchen"] },
  { productId: "p8", name: "Camp Enamel Mug", price: 28, imageUrl: "https://images.unsplash.com/photo-1572119865084-43c285814d63?w=320&h=200&fit=crop", tags: ["mug", "coffee", "cup", "kitchen"] },
  { productId: "p9", name: "Tall Ceramic Mug", price: 35, imageUrl: "https://images.unsplash.com/photo-1570784332176-fdd73da66f03?w=320&h=200&fit=crop", tags: ["mug", "coffee", "cup", "kitchen"] },
  { productId: "p10", name: "Cozy Tea Mug", price: 22, imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=320&h=200&fit=crop", tags: ["mug", "coffee", "cup", "kitchen"] },
];

export const searchProducts = tool({
  name: "search_products",
  description:
    "Search the shop's products. Returns productId, name, price (USD) and imageUrl for each match.",
  inputSchema: z.object({
    query: z.string().describe("Words to match, e.g. 'running shoes'. Empty returns everything."),
    maxPrice: z.number().optional().describe("Only return products at or below this price."),
  }),
  callback: ({ query, maxPrice }) => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = PRODUCTS.filter(
      (p) =>
        (maxPrice === undefined || p.price <= maxPrice) &&
        words.every((w) => p.tags.some((t) => t.startsWith(w.replace(/s$/, ""))) || p.name.toLowerCase().includes(w)),
    );
    return { products: matches.map(({ tags: _tags, ...p }) => p) };
  },
});

export const GENUI_TOOLS = [searchProducts];
