import { merchantManifest } from "@agentpay/merchant-sdk";
import { CHECKOUT_PATH, MERCHANT_ID, MERCHANT_NAME, REGISTRY_URL } from "@/lib/agentpay";

/**
 * The origin AgentPay will call back on. `request.url` is not it: behind a
 * tunnel or a load balancer Next sees the internal host, so the manifest would
 * advertise `localhost:3000` and every purchase would fail at connect time with
 * nothing in this store's logs to show for it. The forwarded host is what the
 * agent actually resolved, and AGENTPAY_PUBLIC_ORIGIN overrides both for
 * deployments that terminate TLS somewhere that rewrites neither.
 */
function publicOrigin(request: Request) {
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

// How an agent standing on a product page learns that PartsRoute takes AgentPay
// and where to send a signed purchase.
export function GET(request: Request) {
  return Response.json(
    merchantManifest({
      origin: publicOrigin(request),
      merchantId: MERCHANT_ID,
      merchantName: MERCHANT_NAME,
      checkoutPath: CHECKOUT_PATH,
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
