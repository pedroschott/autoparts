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

## Machine-readable surface

Two endpoints exist for programmatic buyers and are not linked from the UI:

- `GET /.well-known/agentpay.json` — merchant discovery manifest
- `GET /api/products` — catalog feed, prices in USD minor units
- `POST /api/agentpay/checkout` — resolves a cart, checks stock, prices it, and
  returns an `approved` or `refused` decision

```bash
curl -X POST localhost:3000/api/agentpay/checkout \
  -H 'content-type: application/json' \
  -d '{"mandateId":"mnd_test","merchantId":"partsroute-demo",
       "items":[{"productId":"bp-001","quantity":2}]}'
```

Signature, nonce, mandate and revocation verification are deliberately not
implemented here — that is the payment SDK's job, and the route is written to be
wrapped by it.
