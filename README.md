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

The catalog is hardcoded in `lib/products.ts` (161 parts across 12 systems, all
prices in USD) and `lib/suppliers.ts` (8 suppliers, 14 vehicles). Every product
row carries its brand, part number, price, list price, core charge, stock,
warranty, specs and vehicle fitment, so swapping in a real database later means
replacing those two modules and nothing else.

Part artwork lives in `public/parts/*.svg` — one illustration per part type,
referenced by the `image` slug on each product.

### The fleet

Eight of the vehicles are retail. The other six are a commercial fleet, and they
carry a `unit` and a `role` on top of the usual year/make/model — the labels a
dispatcher uses when a truck is off the road. Each one is stocked with the parts
its failure mode actually needs:

| Unit | Vehicle | Role | Failure it is stocked for |
| --- | --- | --- | --- |
| VAN-17 | 2021 Ford Transit 250 | Last-mile delivery | Tire blowout |
| VAN-22 | 2020 Mercedes-Benz Sprinter 2500 | Delivery | Alternator failure |
| TRUCK-08 | 2022 Ford F-150 XL Fleet | Field service | Bent wheel after accident |
| TRUCK-12 | 2021 Chevrolet Silverado 2500HD | Maintenance crew | Brake failure |
| BOX-03 | 2019 Ford E-450 box truck | Distribution | Battery / cooling failure |
| BOX-07 | 2020 Isuzu NPR | Urban freight | Tire / brake incident |

Fleet rows sit in their own block at the end of `lib/products.ts`, and the id
band names the unit each was stocked for: `x00` VAN-17, `x10` VAN-22, `x20`
TRUCK-08, `x30` TRUCK-12, `x40` BOX-03, `x50` BOX-07. Fitment is deliberately
narrow — a 235/65R16C van tire and a 19.5 in medium-duty tire share a category
and nothing else — so selecting a unit in the vehicle picker shows only what
will bolt on. They are ordinary catalog rows in every other respect: they use
the same twelve mandate categories, so no existing mandate is invalidated by
their arrival.

## AgentPay

PartsRoute accepts autonomous agent purchases through
[AgentPay](https://agentpay-yuno.vercel.app/docs). Three routes carry the whole
integration, all built on `@agentpay/merchant-sdk` 0.3.0:

| Route | Purpose |
| --- | --- |
| `GET /.well-known/agentpay.json` | Discovery: tells an agent this store takes AgentPay, where its catalog is, which mandate categories and currency it uses, and where to send a signed purchase |
| `GET /api/agentpay/catalog` | The store-owned catalog an agent queries through AgentPay's `find_products`. Filters by `q`, `category`, `product_id`, `max_price_cents` and `limit`; returns exact product ids, the coarse mandate category and the USD quote in cents |
| `POST /api/agentpay/checkout` | The guarded checkout. The SDK verifies the agent's Ed25519 signature, request freshness, the single-use nonce, the registry's signature over the mandate, the mandate's live status, and the policy limits. It also quotes delivery for the address on the request |
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

### Delivery

The supplier network is a metro-area one: eight warehouses within about fifteen
miles of each other in New York and New Jersey. What the store can honestly
promise follows from that, so `lib/shipping.ts` quotes each order from the
supplier that actually stocks the part to the address on the request, rather
than from a flat rate that would be wrong in both directions.

| Service | When | Price |
| --- | --- | --- |
| Same-day courier | NY/NJ metro ZIPs (100–104, 110–114, 070–073) | $19.95 |
| Ground | Anywhere else in the US | $12.95, free over $150 |
| Freight, curbside | Radiators, exhausts, tanks, transmissions — anything on a pallet | $24.95 |

Anything outside the US returns `null`, which the SDK turns into
`SHIPPING_ADDRESS_UNSUPPORTED` **before** one of the buyer's approved mandate
uses is consumed — a use spent on an order that could never arrive is a use they
paid for and did not get.

Delivery estimates skip weekends: two business days from a Friday is Tuesday,
and an agent that repeats a Sunday date to a buyer has told them something
false. A supplier more than six miles out adds a day, because it misses the
courier run.

The delivery price is inside `charge.total_cents`, which is what the buyer's
mandate is evaluated against and what a real store would charge. A limit that
covered the sticker price and not the delivery is a limit the buyer never
agreed to. An approved checkout answers with a `shipment` block — order id,
method, carrier, the supplier it ships from, handling time, the estimated
window and any notes — so the agent can tell the buyer when the part arrives.

### What the store receives about the buyer

The checkout body carries the delivery address (the buyer's registered one, or
a one-off they named for this order) and `purchase_reason`: their own words for
why they are buying it. AgentPay holds both; the agent never collects an address
in conversation, which matters because the person texting an agent is not always
the person holding the card.

The store never receives an identity. On AgentPay's merchant API the buyer is a
stable per-merchant pseudonym — enough to recognise a repeat customer, not
enough to identify a person. That is also where a disputed charge is answered:
`/api/v1/merchants/<id>/transactions` and `/api/v1/merchants/<id>/disputes`, or
the **Activity** and **Disputes** tabs of the merchant console.

### Configuration

Copy `.env.example` to `.env.local`. Nothing in it is a secret — every check the
SDK makes is cryptographic or public.

| Variable | Meaning |
| --- | --- |
| `AGENTPAY_MERCHANT_ID` | The immutable `mrc_…` id from the merchant console |
| `AGENTPAY_REGISTRY_URL` | The AgentPay deployment to verify against |
| `AGENTPAY_PUBLIC_ORIGIN` | Optional. Forces the origin the manifest and catalog advertise, for proxies that rewrite neither `x-forwarded-host` nor `x-forwarded-proto` |

The manifest advertises `custom-shipping` and `ships_to: ["US"]`, so an agent
knows before it tries that it may send a one-off address and which countries
this store serves.

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

Five of those cases cover delivery: a Brooklyn address quoted as courier, a
Denver one falling back to ground, an address abroad refused before a use is
spent, a checkout with no address at all, and an order that only escalates
because the courier fee pushed it over the buyer's per-purchase limit.

`tests/catalog-data.test.ts` covers the hand-written table itself: unique ids and
part numbers, a real supplier, artwork file and vehicle behind every row, a price
below list, and a storefront category that maps to an advertised mandate slug
rather than falling through to `parts`. It also holds each fleet unit to enough
depth to demo on, including parts for its own failure mode.

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

Two more worth rehearsing live, because they are the ones that surprise people:
ask the agent to ship one order to a different address and watch the quote and
the total change; then ask it to ship somewhere outside the US and watch the
store refuse without consuming a mandate use.
