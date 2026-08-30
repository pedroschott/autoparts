import { createHash } from "node:crypto";
import { checkout } from "@/lib/agentpay";

/**
 * Merchant-side checkout route.
 *
 * The SDK handler owns every check that decides whether the money is allowed to
 * move: the agent's Ed25519 signature over the exact bytes and path, request
 * freshness, single-use nonce, the registry's signature over the mandate, the
 * mandate's live status read uncached so a revocation one second ago lands, and
 * the policy limits. It refuses anything it cannot prove.
 *
 * What is left for the store is what only the store knows: what the part costs
 * and what it takes to get it there. The agent sends a product id and never an
 * amount, so a price is never negotiable — see resolveProduct and
 * resolveFulfillment in lib/agentpay.ts.
 *
 * Do not read the request body here. The handler needs the raw bytes to verify
 * sha256(body); parsing first breaks every signature.
 */
export async function POST(request: Request) {
  const response = await checkout(request);

  // 401/400/404 are transport-level rejections with no decision to act on.
  if (!response.ok) return response;

  const result = await response.clone().json();
  const nonce = request.headers.get("x-nonce");

  console.info("agentpay.checkout", {
    status: response.status,
    decision: result.decision,
    reason: result.reason_code,
    checks: result.checks,
    product_id: result.product?.id,
    total_cents: result.charge?.total_cents,
    shipping_cents: result.charge?.shipping_cents,
    ships_to: result.fulfillment?.ships_to?.postal_code,
    address_source: result.fulfillment?.address_source,
    nonce,
    path: new URL(request.url).pathname,
  });

  // Only an approval may move money. `escalated` and `refused` are returned
  // untouched so the agent can ask the buyer for a one-time approval or explain
  // the reason code — including SHIPPING_ADDRESS_UNSUPPORTED, which the handler
  // returns for an address outside the supplier network before any limit is
  // touched.
  if (result.decision !== "approved") return response;

  // This build ships AgentPay's mock payment rail, so there is no provider call
  // to make. A real store charges `charge.total_cents` here — the part plus the
  // delivery it just quoted, which is the amount the mandate was checked
  // against — and keys the charge to the nonce, which identifies exactly one
  // authorized attempt. A replay cannot reach this line because the registry
  // refuses to consume the same nonce twice.
  const orderId = `PR-${createHash("sha256").update(nonce ?? "").digest("hex").slice(0, 10).toUpperCase()}`;

  // Everything the buyer needs to know about the parcel travels back with the
  // decision, so the agent can say when the part arrives instead of promising a
  // confirmation email nobody sends.
  return Response.json({
    ...result,
    order_id: orderId,
    shipment: result.fulfillment
      ? {
          order_id: orderId,
          status: "confirmed",
          method: result.fulfillment.method,
          carrier: result.fulfillment.carrier ?? null,
          ship_from: result.fulfillment.ship_from ?? null,
          handling_time: result.fulfillment.handling_time,
          estimated_delivery: result.fulfillment.estimated_delivery,
          shipping_cents: result.fulfillment.shipping_cents,
          ships_to: result.fulfillment.ships_to,
          address_source: result.fulfillment.address_source,
          notes: result.fulfillment.notes ?? [],
        }
      : null,
  });
}
