import {
  createAgentPayCatalogHandler,
  createAgentPayCheckoutHandler,
  type AgentPayCatalogProduct,
  type MerchantProduct,
} from "@agentpay/merchant-sdk";
import { productById, products } from "./products";
import { supplierById } from "./suppliers";
import type { Product } from "./types";

export const MERCHANT_ID = process.env.AGENTPAY_MERCHANT_ID ?? "mrc_835dda9e14b9709870f2";
export const MERCHANT_NAME = "PartsRoute";
export const CHECKOUT_PATH = "/api/agentpay/checkout";
export const CATALOG_PATH = "/api/agentpay/catalog";
export const PRODUCT_URL_TEMPLATE = "/product/{id}";
export const REGISTRY_URL =
  process.env.AGENTPAY_REGISTRY_URL ?? "https://agentpay-yuno.vercel.app";

/** What the storefront shows a person. Every price in lib/products.ts is USD. */
export const STORE_CURRENCY = "USD";

/**
 * What PartsRoute quotes an agent. The policy engine compares this against the
 * mandate's own currency exactly and refuses a mismatch rather than converting,
 * so the quote has to be denominated in the currency buyers actually hold
 * mandates in — BRL today. Quoting USD here returns CURRENCY_MISMATCH on every
 * purchase, which looks like a broken integration rather than a refusal.
 */
export const CURRENCY = process.env.AGENTPAY_CURRENCY ?? "BRL";

/**
 * The rate the storefront's USD prices are converted at when the agent quote is
 * in another currency. It is a published rate, not a live one: the agent is
 * quoted a number that must still be honourable when the charge settles, and a
 * rate that moves between the quote and the charge is a price that moved.
 */
export const FX_RATE_FROM_USD = Number(process.env.AGENTPAY_FX_RATE_FROM_USD ?? "5.40");

/**
 * The storefront's display categories are merchandising labels ("Suspension &
 * Steering"). A mandate category is different: the buyer reads it while
 * deciding what to let an agent spend on, and the policy engine matches it
 * exactly. These stay coarse, lowercase and stable — renaming one silently
 * invalidates every mandate already scoped to it.
 */
const CATEGORY_SLUGS: Record<string, string> = {
  Brakes: "brakes",
  Engine: "engine",
  Filters: "filters",
  "Suspension & Steering": "suspension",
  Electrical: "electrical",
  "Body & Lighting": "lighting",
  "Wheels & Tires": "tires",
  Fluids: "fluids",
  Exhaust: "exhaust",
  Drivetrain: "drivetrain",
  Cooling: "cooling",
  Fuel: "fuel",
};

export const AGENTPAY_CATEGORIES = Array.from(new Set(Object.values(CATEGORY_SLUGS))).sort();

export function agentPayCategory(product: Product) {
  return CATEGORY_SLUGS[product.category] ?? "parts";
}

/**
 * What the agent is charged: the part plus any core deposit, in CURRENCY minor
 * units. The agent never sends an amount — this is the only number the mandate
 * is evaluated against, so a price is never negotiable.
 *
 * Rounding is a single step on the total rather than per component, so the
 * amount quoted in the catalog feed is the same integer the policy engine
 * checks against the limit.
 */
export function agentPayPriceCents(product: Product) {
  const usd = product.price + (product.core ?? 0);
  const quoted = CURRENCY === STORE_CURRENCY ? usd : usd * FX_RATE_FROM_USD;
  return Math.round(quoted * 100);
}

export function agentPayProduct(product: Product): MerchantProduct {
  return {
    id: product.id,
    merchant_id: MERCHANT_ID,
    name: product.name,
    category: agentPayCategory(product),
    price_cents: agentPayPriceCents(product),
    currency: CURRENCY,
  };
}

export const checkout = createAgentPayCheckoutHandler({
  merchantId: MERCHANT_ID,
  registryUrl: REGISTRY_URL,
  resolveProduct: async (productId) => {
    const product = productById[productId];
    // Out of stock is "not for sale" as far as the mandate is concerned: the
    // handler answers 404 without spending one of the buyer's approved uses.
    if (!product || product.stock < 1) return null;
    return agentPayProduct(product);
  },
});

/**
 * The origin AgentPay and agents will call back on. `request.url` is not it:
 * behind a tunnel or a load balancer Next sees the internal host, so the
 * manifest would advertise `localhost:3000` and every purchase would fail at
 * connect time with nothing in this store's logs to show for it. The forwarded
 * host is what the agent actually resolved, and AGENTPAY_PUBLIC_ORIGIN overrides
 * both for deployments that terminate TLS somewhere that rewrites neither.
 */
export function publicOrigin(request: Request) {
  const override = process.env.AGENTPAY_PUBLIC_ORIGIN;
  if (override) return new URL(override).origin;

  const headers = request.headers;
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!host) return new URL(request.url).origin;

  const proto =
    headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${proto}://${host}`;
}

export function productPath(product: Pick<Product, "id">) {
  return `/product/${product.id}`;
}

/**
 * The catalog entry an agent sees through `find_products`. It is derived from
 * the same functions as the checkout quote, so the price and category the agent
 * sizes a mandate from are the integer and slug the policy engine will check.
 */
export function agentPayCatalogProduct(product: Product, origin: string): AgentPayCatalogProduct {
  return {
    product_id: product.id,
    name: `${product.brand} ${product.name}`,
    description: `${product.description} Part number ${product.partNumber}. ${product.subCategory}${product.position ? `, ${product.position}` : ""}. Supplier: ${supplierById[product.supplierId].name}.`,
    category: agentPayCategory(product),
    price_cents: agentPayPriceCents(product),
    currency: CURRENCY,
    sku: product.partNumber,
    brand: product.brand,
    availability: product.stock > 0 ? "in_stock" : "out_of_stock",
    url: `${origin}${productPath(product)}`,
  };
}

/**
 * The catalog route advertised as `catalog_endpoint`. Built per request so the
 * product URLs carry the public origin the agent actually resolved.
 */
export function catalog(request: Request) {
  const origin = publicOrigin(request);
  return createAgentPayCatalogHandler({
    merchantId: MERCHANT_ID,
    merchantName: MERCHANT_NAME,
    currency: CURRENCY,
    categories: AGENTPAY_CATEGORIES,
    products: () => products.map((product) => agentPayCatalogProduct(product, origin)),
    maxAgeSeconds: 300,
  })(request);
}
