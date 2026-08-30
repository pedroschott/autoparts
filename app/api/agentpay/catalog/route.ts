import { catalog } from "@/lib/agentpay";

/**
 * Store-owned catalog, advertised as `catalog_endpoint` in the manifest.
 *
 * This is the route an agent's `find_products` calls instead of scraping a
 * rendered page: it answers with exact product ids, the coarse mandate category
 * and the USD quote in cents, filtered by `q`, `category`, `product_id`,
 * `max_price_cents` and `limit`. Every value comes from lib/agentpay.ts, the
 * same module that prices the checkout, so the catalog can never advertise a
 * number the policy engine would then refuse.
 */
export function GET(request: Request) {
  return catalog(request);
}
