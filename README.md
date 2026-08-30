# PartsRoute

An auto-parts ecommerce marketplace: search parts by vehicle, compare live
pricing and availability across local suppliers, and check out from one cart.

Built with Next.js 16 (App Router), React 19 and Tailwind CSS 4.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## What is in here

| Route | Purpose |
| --- | --- |
| `/` | Part search: supplier facets, part-type and brand filters, sorting, cart rail |
| `/product/[id]` | Part detail with specs, fitment and supplier availability |
| `/cart` | Cart grouped by supplier |
| `/checkout` | Shipping and payment form (demo only, nothing is charged) |
| `/orders` | Order history, stored locally in the browser |
| `/catalog` | Browse the catalog by vehicle system |
| `/suppliers` | The connected supplier network |

## Data

The catalog is hardcoded in `lib/products.ts` (55 parts across 12 systems, all
prices in USD) and `lib/suppliers.ts` (8 suppliers, 8 vehicles). Every product
row carries its brand, part number, price, list price, core charge, stock,
warranty, specs and vehicle fitment, so swapping in a real database later means
replacing those two modules and nothing else.

Part artwork lives in `public/parts/*.svg` — one illustration per part type,
referenced by the `image` slug on each product.

## AgentPay

PartsRoute accepts autonomous agent purchases through
[AgentPay](https://agentpay-yuno.vercel.app/docs). Three routes carry the whole
integration, all built on `@agentpay/merchant-sdk` 0.2.0:

| Route | Purpose |
| --- | --- |
| `GET /.well-known/agentpay.json` | Discovery: tells an agent this store takes AgentPay, where its catalog is, which mandate categories and currency it uses, and where to send a signed purchase |
| `GET /api/agentpay/catalog` | The store-owned catalog an agent queries through AgentPay's `find_products`. Filters by `q`, `category`, `product_id`, `max_price_cents` and `limit`; returns exact product ids, the coarse mandate category and the USD quote in cents |
| `POST /api/agentpay/checkout` | The guarded checkout. The SDK verifies the agent's Ed25519 signature, request freshness, the single-use nonce, the registry's signature over the mandate, the mandate's live status, and the policy limits |
| `GET /api/products` | Human-oriented catalog feed with both the USD storefront price and the AgentPay quote |

Every product page also carries the same values in `<meta name="agentpay:*">`
tags and JSON-LD (`productID`, an AgentPay `Offer` in USD cents including any core deposit, and
`additionalProperty` entries), so an agent that lands on `/product/bp-001`
without calling the catalog still reads the exact id, category and quote
instead of guessing them from the URL or the name.

The agent sends a product id and never an amount — `resolveProduct` in
`lib/agentpay.ts` is the only thing that prices a part, and the catalog and the
page metadata are derived from the same functions, so a price is never
negotiable and the three surfaces can never disagree. Out-of-stock parts
resolve to `null` at checkout and sort last in the catalog, marked
`out_of_stock`. Only an `approved` decision creates an order.

### Configuration

Copy `.env.example` to `.env.local`. Nothing in it is a secret — every check the
SDK makes is cryptographic or public.

| Variable | Meaning |
| --- | --- |
| `AGENTPAY_MERCHANT_ID` | The immutable `mrc_…` id from the merchant console |
| `AGENTPAY_REGISTRY_URL` | The AgentPay deployment to verify against |
| `AGENTPAY_PUBLIC_ORIGIN` | Optional. Forces the origin the manifest and catalog advertise, for proxies that rewrite neither `x-forwarded-host` nor `x-forwarded-proto` |

Agents are quoted in USD cents, the only currency AgentPay mandates are
denominated in; the policy engine converts nothing and refuses any other
currency with `CURRENCY_MISMATCH`. The quote is the part plus any core deposit,
so it can differ from the storefront's sticker price: both are in the feed as
`priceCents` and `agentpayPriceCents`.

### Testing it

`npm test` runs the offline suite in `tests/agentpay-checkout.test.ts`: a stub
registry and a fixed clock drive approved, escalated and every refusal path with
no network and no buyer. It exists to catch the two mistakes that silently
disable AgentPay — a body parser that breaks signatures, and a refactor that
charges before reading the decision.

The 10-second smoke test, which must return 401:

```bash
curl -i -X POST localhost:3000/api/agentpay/checkout \
  -H 'content-type: application/json' \
  -d '{"mandate_id":"00000000-0000-4000-8000-000000000000",
       "merchant_id":"mrc_835dda9e14b9709870f2","product_id":"bp-001"}'
```

For a live run, AgentPay has to reach the store, so expose it on public HTTPS
and confirm the manifest advertises that origin rather than `localhost`:

```bash
cloudflared tunnel --url http://localhost:3000
curl https://<tunnel-host>/.well-known/agentpay.json
```

Then, as the buyer: create a mandate scoped to this merchant id and the
`brakes` category, approve it with a passkey, and let the agent purchase
`bp-001`. Revoking the mandate refuses the very next attempt with
`MANDATE_REVOKED`, on the first try, with no cache to wait out.
