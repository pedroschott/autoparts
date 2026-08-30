import { describe, expect, it } from "vitest";
import { discoverAgentPayCatalog, discoverAgentPayMerchant } from "@agentpay/merchant-sdk";
import { GET as manifest } from "@/app/.well-known/agentpay.json/route";
import { GET as catalogRoute } from "@/app/api/agentpay/catalog/route";
import { AGENTPAY_CATEGORIES, CURRENCY, MERCHANT_ID, agentPayCategory, agentPayPriceCents } from "@/lib/agentpay";
import { productById, products } from "@/lib/products";

/**
 * The catalog is what an agent reads instead of scraping a page. These tests
 * pin the two things that make it trustworthy: the manifest advertises it, and
 * every price and category in it is the one the checkout will enforce.
 */

const ORIGIN = "https://partsroute.example";

function request(path: string) {
  return new Request(`${ORIGIN}${path}`, { headers: { host: "partsroute.example", "x-forwarded-proto": "https" } });
}

// Routes the SDK's discovery client through the store's own route handlers, no network.
const fetcher: typeof fetch = async (input) => {
  const url = new URL(input.toString());
  if (url.pathname === "/.well-known/agentpay.json") return manifest(request(url.pathname));
  if (url.pathname === "/api/agentpay/catalog") return catalogRoute(request(`${url.pathname}${url.search}`));
  return new Response(null, { status: 404 });
};

describe("agentpay catalog", () => {
  it("is advertised by the manifest with the store's categories and currency", async () => {
    const found = await discoverAgentPayMerchant(`${ORIGIN}/product/bp-001`, fetcher);
    expect(found.merchant.id).toBe(MERCHANT_ID);
    expect(found.catalog_endpoint).toBe(`${ORIGIN}/api/agentpay/catalog`);
    expect(found.categories).toEqual(AGENTPAY_CATEGORIES);
    expect(found.currency).toBe(CURRENCY);
    expect(found.product_url_template).toBe(`${ORIGIN}/product/{id}`);
    expect(found.capabilities).toContain("catalog-search");
  });

  it("answers a search with exact ids and the same quote the checkout enforces", async () => {
    const catalog = await discoverAgentPayCatalog(`${ORIGIN}/product/bp-001`, { q: "bosch rotor" }, fetcher);
    const rotor = catalog.products.find((p) => p.product_id === "bp-001");
    expect(rotor).toBeDefined();
    expect(rotor?.category).toBe(agentPayCategory(productById["bp-001"]));
    expect(rotor?.price_cents).toBe(agentPayPriceCents(productById["bp-001"]));
    expect(rotor?.currency).toBe(CURRENCY);
    expect(rotor?.url).toBe(`${ORIGIN}/product/bp-001`);
    expect(catalog.merchant.id).toBe(MERCHANT_ID);
  });

  it("filters by mandate category and price ceiling, and finds a product by exact id", async () => {
    const brakes = await discoverAgentPayCatalog(ORIGIN, { category: "brakes", maxPriceCents: 30_000, limit: 50 }, fetcher);
    expect(brakes.products.length).toBeGreaterThan(0);
    for (const product of brakes.products) {
      expect(product.category).toBe("brakes");
      expect(product.price_cents).toBeLessThanOrEqual(30_000);
    }
    const exact = await discoverAgentPayCatalog(ORIGIN, { productId: "fl-001" }, fetcher);
    expect(exact.products.map((p) => p.product_id)).toEqual(["fl-001"]);
    expect(exact.total).toBe(1);
  });

  it("lists every in-stock part and marks the rest out of stock, never omitting them", async () => {
    const all = await discoverAgentPayCatalog(ORIGIN, { limit: 50 }, fetcher);
    expect(all.total).toBe(products.length);
    const outOfStock = products.filter((p) => p.stock < 1).map((p) => p.id);
    for (const product of all.products) {
      expect(product.availability).toBe(outOfStock.includes(product.product_id) ? "out_of_stock" : "in_stock");
    }
  });
});
