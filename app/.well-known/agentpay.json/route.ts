import { merchantManifest } from "@agentpay/merchant-sdk";
import {
  AGENTPAY_CATEGORIES,
  CATALOG_PATH,
  CHECKOUT_PATH,
  CURRENCY,
  MERCHANT_ID,
  MERCHANT_NAME,
  PRODUCT_URL_TEMPLATE,
  REGISTRY_URL,
  SHIPS_TO,
  publicOrigin,
} from "@/lib/agentpay";

// How an agent standing on a product page learns that PartsRoute takes AgentPay,
// where to ask about products, which categories a mandate may name, which
// currency it must be in, where the store delivers, and where to send a signed
// purchase.
export function GET(request: Request) {
  return Response.json(
    merchantManifest({
      origin: publicOrigin(request),
      merchantId: MERCHANT_ID,
      merchantName: MERCHANT_NAME,
      checkoutPath: CHECKOUT_PATH,
      catalogPath: CATALOG_PATH,
      categories: AGENTPAY_CATEGORIES,
      currency: CURRENCY,
      productUrlTemplate: PRODUCT_URL_TEMPLATE,
      customShipping: true,
      shipsTo: [...SHIPS_TO],
      registryUrl: REGISTRY_URL,
    }),
    {
      headers: {
        "access-control-allow-origin": "*",
        "cache-control": "public, max-age=300",
      },
    }
  );
}
