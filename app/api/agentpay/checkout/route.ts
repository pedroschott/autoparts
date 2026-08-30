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
 * What is left for the store is what only the store knows: what the part costs.
 * The agent sends a product id and never an amount, so a price is never
 * negotiable — see resolveProduct in lib/agentpay.ts.
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
    nonce,
    path: new URL(request.url).pathname,
  });

  // Only an approval may move money. `escalated` and `refused` are returned
  // untouched so the agent can ask the buyer for a one-time approval or explain
  // the reason code.
  if (result.decision !== "approved") return response;

  // This build ships AgentPay's mock payment rail, so there is no provider call
  // to make. A real store charges here and keys the charge to the nonce, which
  // identifies exactly one authorized attempt — a replay cannot reach this line
  // because the registry refuses to consume the same nonce twice.
  const orderId = `PR-${createHash("sha256").update(nonce ?? "").digest("hex").slice(0, 10).toUpperCase()}`;

  return Response.json({ ...result, order_id: orderId });
}
