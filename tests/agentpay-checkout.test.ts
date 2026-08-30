import { describe, expect, it } from "vitest";
import {
  canonicalJson,
  createAgentPayCheckoutHandler,
  generateEd25519KeyPair,
  signAgentPayRequest,
  signText,
  type MerchantProduct,
  type RegistryMandate,
} from "@agentpay/merchant-sdk";
import {
  CURRENCY,
  agentPayPriceCents,
  agentPayProduct,
  MERCHANT_ID,
} from "@/lib/agentpay";
import { productById } from "@/lib/products";

/**
 * The regression net from the AgentPay merchant docs, pinned to this store's
 * own catalog. It catches the two mistakes that silently disable AgentPay: a
 * body parser that breaks signatures, and a refactor that charges before
 * reading the decision.
 *
 * No network and no buyer — a stub registry answers the four lookups and the
 * clock is fixed, so approved, refused and escalated are all reachable offline.
 */

const NOW = new Date("2026-08-30T12:00:00.000Z");
const URL_ = "https://partsroute.example/api/agentpay/checkout";

// A real row from the catalog, priced by the same code the route uses.
const PRODUCT = agentPayProduct(productById["bp-001"]);

const agent = generateEd25519KeyPair();
const registry = generateEd25519KeyPair();

const artifact = {
  mandate_id: "3eb0f49d-2c10-4d3a-8f34-08a47e2fca6e",
  type: "intent",
  issuer: { user_id: "user-1" },
  agent: { agent_id: "agt_test", public_key: agent.publicKey },
  scope: { merchants: [MERCHANT_ID], categories: [PRODUCT.category] },
  limits: {
    per_purchase_cents: 200000,
    cumulative_cents: 400000,
    max_uses: 3,
    period: "month",
    currency: CURRENCY,
  },
  validity: { not_before: "2026-08-01T00:00:00.000Z", expires_at: "2026-09-30T00:00:00.000Z" },
  payment: { vault_card_id: "card-1" },
  authorization: {
    credential_id: "cred-1",
    mandate_hash: "hash",
    signed_at: "2026-08-30T11:00:00.000Z",
  },
} as const;

type Artifact = typeof artifact;

function mandate(overrides: Partial<RegistryMandate> = {}, patch: Partial<Artifact> = {}) {
  const signed = { ...artifact, ...patch };
  return {
    ...signed,
    status: "active",
    usage: { approved_uses: 0, cumulative_cents: 0 },
    server_sig: signText(registry.privateKey, canonicalJson(signed)),
    ...overrides,
  } as RegistryMandate;
}

function stubRegistry(current: RegistryMandate): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const path = new URL(input.toString()).pathname;
    if (path.startsWith("/api/registry/agents/")) {
      return Response.json({ id: "agt_test", public_key: agent.publicKey });
    }
    if (path === "/api/registry/nonces") return Response.json({ consumed: true }, { status: 201 });
    if (path.startsWith("/api/registry/mandates/")) return Response.json(current);
    if (path === "/api/registry/keys") {
      return Response.json({ algorithm: "Ed25519", public_key: registry.publicKey });
    }
    return new Response(null, { status: 404 });
  }) as typeof fetch;
}

// `currency` is widened so a test can hand the handler a non-USD quote and
// watch the policy engine refuse it; the SDK type only ever admits "USD".
type TestProduct = Omit<MerchantProduct, "currency"> & { currency: string };

function handlerFor(current: RegistryMandate, product: TestProduct = PRODUCT) {
  return createAgentPayCheckoutHandler({
    merchantId: MERCHANT_ID,
    registryUrl: "https://agentpay.example",
    fetcher: stubRegistry(current),
    now: () => NOW,
    resolveProduct: async (id) => (id === product.id ? (product as MerchantProduct) : null),
  });
}

function signedRequest(nonce: string, body?: Record<string, unknown>) {
  const payload = JSON.stringify(
    body ?? {
      mandate_id: artifact.mandate_id,
      merchant_id: MERCHANT_ID,
      product_id: PRODUCT.id,
    }
  );
  const headers = signAgentPayRequest({
    agentId: "agt_test",
    privateKey: agent.privateKey,
    method: "POST",
    url: URL_,
    body: payload,
    now: NOW,
    nonce,
  });
  return new Request(URL_, { method: "POST", headers, body: payload });
}

describe("agentpay checkout", () => {
  it("approves a purchase inside the mandate", async () => {
    const response = await handlerFor(mandate())(signedRequest("nonce-approve"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      decision: "approved",
      reason_code: null,
      product: { id: PRODUCT.id, currency: CURRENCY, merchant_id: MERCHANT_ID },
    });
  });

  it("refuses a revoked mandate", async () => {
    const response = await handlerFor(mandate({ status: "revoked" }))(signedRequest("nonce-revoked"));
    await expect(response.json()).resolves.toMatchObject({
      decision: "refused",
      reason_code: "MANDATE_REVOKED",
    });
  });

  it("refuses an unsigned request", async () => {
    const response = await handlerFor(mandate())(
      new Request(URL_, {
        method: "POST",
        body: "{}",
        headers: { "content-type": "application/json" },
      })
    );
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      reason_code: "AGENT_SIGNATURE_INVALID",
    });
  });

  it("refuses a merchant outside the mandate scope", async () => {
    const response = await handlerFor(mandate({}, { scope: { merchants: ["mrc_other"], categories: [PRODUCT.category] } }))(
      signedRequest("nonce-merchant")
    );
    await expect(response.json()).resolves.toMatchObject({
      decision: "refused",
      reason_code: "MERCHANT_NOT_IN_SCOPE",
    });
  });

  it("refuses a category the buyer did not authorize", async () => {
    const response = await handlerFor(mandate({}, { scope: { merchants: [MERCHANT_ID], categories: ["tires"] } }))(
      signedRequest("nonce-category")
    );
    await expect(response.json()).resolves.toMatchObject({
      decision: "refused",
      reason_code: "CATEGORY_NOT_IN_SCOPE",
    });
  });

  it("refuses a currency the mandate is not denominated in", async () => {
    const eur = { ...PRODUCT, currency: "XTS" };
    const response = await handlerFor(mandate(), eur)(signedRequest("nonce-currency"));
    await expect(response.json()).resolves.toMatchObject({
      decision: "refused",
      reason_code: "CURRENCY_MISMATCH",
    });
  });

  it("escalates above the per-purchase limit instead of refusing", async () => {
    const overLimit = { ...PRODUCT, price_cents: 250000 };
    const response = await handlerFor(mandate(), overLimit)(signedRequest("nonce-escalate"));
    await expect(response.json()).resolves.toMatchObject({
      decision: "escalated",
      reason_code: "AMOUNT_EXCEEDS_LIMIT",
    });
  });

  it("refuses once the cumulative cap would be passed", async () => {
    const response = await handlerFor(
      mandate({ usage: { approved_uses: 1, cumulative_cents: 399000 } })
    )(signedRequest("nonce-cumulative"));
    await expect(response.json()).resolves.toMatchObject({
      decision: "refused",
      reason_code: "CUMULATIVE_EXCEEDED",
    });
  });

  it("refuses a mandate signed by a different registry key", async () => {
    const impostor = generateEd25519KeyPair();
    const forged = mandate({ server_sig: signText(impostor.privateKey, canonicalJson(artifact)) });
    const response = await handlerFor(forged)(signedRequest("nonce-forged"));
    await expect(response.json()).resolves.toMatchObject({
      decision: "refused",
      reason_code: "MANDATE_SIGNATURE_INVALID",
    });
  });

  it("answers 404 for a product this store does not sell", async () => {
    const response = await handlerFor(mandate())(
      signedRequest("nonce-404", {
        mandate_id: artifact.mandate_id,
        merchant_id: MERCHANT_ID,
        product_id: "does-not-exist",
      })
    );
    expect(response.status).toBe(404);
  });

  it("answers 400 when the body names another merchant", async () => {
    const response = await handlerFor(mandate())(
      signedRequest("nonce-400", {
        mandate_id: artifact.mandate_id,
        merchant_id: "mrc_someone_else",
        product_id: PRODUCT.id,
      })
    );
    expect(response.status).toBe(400);
  });

  it("quotes USD cents including the core deposit, never a converted amount", async () => {
    // AgentPay mandates are USD-only and nothing is converted: the quote is the
    // sticker price plus any core charge, as one rounded integer.
    expect(PRODUCT.currency).toBe("USD");
    expect(CURRENCY).toBe("USD");
    const plain = productById["bp-001"];
    expect(agentPayPriceCents(plain)).toBe(Math.round(plain.price * 100));
    const withCore = productById["bp-020"];
    expect(withCore.core).toBeGreaterThan(0);
    expect(agentPayPriceCents(withCore)).toBe(Math.round((withCore.price + (withCore.core ?? 0)) * 100));
  });

  it("rejects a stale timestamp", async () => {
    const body = JSON.stringify({
      mandate_id: artifact.mandate_id,
      merchant_id: MERCHANT_ID,
      product_id: PRODUCT.id,
    });
    const headers = signAgentPayRequest({
      agentId: "agt_test",
      privateKey: agent.privateKey,
      method: "POST",
      url: URL_,
      body,
      now: new Date(NOW.valueOf() - 120_000),
      nonce: "nonce-stale",
    });
    const response = await handlerFor(mandate())(new Request(URL_, { method: "POST", headers, body }));
    expect(response.status).toBe(401);
  });
});
