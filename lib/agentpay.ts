import {
  createAgentPayCatalogHandler,
  createAgentPayCheckoutHandler,
  type AgentPayCatalogProduct,
  type MerchantProduct,
} from "@agentpay/merchant-sdk";
import { productById, products } from "./products";
import { quoteFulfillment, SHIPS_TO } from "./shipping";
import { supplierById } from "./suppliers";
import type { Product } from "./types";

export const MERCHANT_ID = process.env.AGENTPAY_MERCHANT_ID ?? "mrc_835dda9e14b9709870f2";
export const MERCHANT_NAME = "PartsRoute";
export const CHECKOUT_PATH = "/api/agentpay/checkout";
export const CATALOG_PATH = "/api/agentpay/catalog";
export const PRODUCT_URL_TEMPLATE = "/product/{id}";
export const REGISTRY_URL =
  process.env.AGENTPAY_REGISTRY_URL ?? "https://agentpay-yuno.vercel.app";

/**
 * The only currency AgentPay mandates are denominated in, and the currency
 * every price in lib/products.ts is already in. The policy engine compares the
 * quote against the mandate's currency exactly and refuses a mismatch rather
 * than converting, so this is a constant, not configuration: the SDK types it
 * as the literal "USD" and a store quoting anything else is refused with
 * CURRENCY_MISMATCH on every purchase.
 */
export const CURRENCY = "USD" as const;

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
 * What the agent is charged: the part plus any core deposit, in USD cents. The
 * agent never sends an amount — this is the only number the mandate is
 * evaluated against, so a price is never negotiable.
 *
 * Rounding is a single step on the total rather than per component, so the
 * amount in the catalog, on the product page and at checkout is the same
 * integer the policy engine checks against the limit.
 */
export function agentPayPriceCents(product: Product) {
  return Math.round((product.price + (product.core ?? 0)) * 100);
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
  /**
   * Delivery is quoted per order, from the supplier that stocks the part to the
   * address on the request. It is priced before the policy runs because the
   * mandate limit has to cover what the buyer is actually charged, and returning
   * `null` for an address the network does not serve refuses the order without
   * consuming one of the buyer's approved uses.
   */
  resolveFulfillment: ({ product: quoted, address, address_source, now }) => {
    const product = productById[quoted.id];
    if (!product) return null;
    return quoteFulfillment({
      product,
      address,
      addressSource: address_source,
      subtotalCents: quoted.price_cents,
      now,
    });
  },
});

export { SHIPS_TO };

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
