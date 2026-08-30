import { deliveryWindow, type Fulfillment, type ShippingAddress } from "@agentpay/merchant-sdk";

import { supplierById } from "./suppliers";
import type { Product } from "./types";

/**
 * PartsRoute's supplier network is a metro-area one: eight warehouses inside
 * about fifteen miles of each other in New York and New Jersey. What a store can
 * promise about delivery follows from that, so the quote is derived from the
 * supplier that actually stocks the part and the address the order is going to —
 * not from a flat rate that would be wrong in both directions.
 */

/** The only country the supplier network delivers to. */
export const SHIPS_TO = ["US"] as const;

/**
 * ZIP prefixes inside the same-day courier radius: Manhattan and the Bronx
 * (100–104), Brooklyn and Queens (110–114), and northern New Jersey (070–073).
 * Anything else in the US is a ground shipment.
 */
const COURIER_ZIP_PREFIXES = [
  "100", "101", "102", "103", "104",
  "110", "111", "112", "113", "114",
  "070", "071", "072", "073",
];

/** Ground shipping is free once the order is large enough to justify it. */
const FREE_GROUND_THRESHOLD_CENTS = 15_000;
const GROUND_CENTS = 1_295;
const EXPEDITED_GROUND_CENTS = 2_495;
const COURIER_CENTS = 1_995;

/** Heavy parts move on a pallet and never on the bike courier. */
const OVERSIZED_SUBCATEGORIES = new Set([
  "Radiator",
  "Catalytic Converter",
  "Muffler",
  "Fuel Tank",
  "Transmission",
]);

export type ServiceLevel = "courier" | "ground" | "freight";

function normalizedZip(postalCode: string): string {
  return postalCode.replace(/\D/g, "").padStart(5, "0").slice(0, 5);
}

export function isServiceable(address: ShippingAddress): boolean {
  if (address.country_code.toUpperCase() !== "US") return false;
  // A US address without five resolvable digits cannot be routed to a supplier
  // run, and guessing one is how a part ends up on the wrong truck.
  return /^\d{5}$/.test(normalizedZip(address.postal_code));
}

export function serviceLevelFor(product: Product, address: ShippingAddress): ServiceLevel {
  const zip = normalizedZip(address.postal_code);
  const oversized = OVERSIZED_SUBCATEGORIES.has(product.subCategory);
  if (oversized) return "freight";
  return COURIER_ZIP_PREFIXES.some((prefix) => zip.startsWith(prefix)) ? "courier" : "ground";
}

/**
 * The delivery PartsRoute commits to for one part going to one address. Returns
 * `null` for an address the network does not serve, which the SDK turns into
 * `SHIPPING_ADDRESS_UNSUPPORTED` before the buyer's mandate is touched.
 */
export function quoteFulfillment(input: {
  product: Product;
  address: ShippingAddress;
  addressSource: "registered" | "custom";
  subtotalCents: number;
  now: Date;
}): Fulfillment | null {
  const { product, address, addressSource, subtotalCents, now } = input;
  if (!isServiceable(address)) return null;

  const supplier = supplierById[product.supplierId];
  const level = serviceLevelFor(product, address);
  const notes: string[] = [];

  // The supplier's own distance is the part of the estimate PartsRoute does not
  // control: a part sitting fourteen miles out cannot make the same courier run
  // as one sitting a mile away.
  const pickupDays = supplier.distanceMi <= 6 ? 0 : 1;

  const plan =
    level === "courier"
      ? {
          method: "Same-day courier",
          carrier: "PartsRoute Courier",
          handling: supplier.distanceMi <= 6
            ? "Picked up from the supplier within 2 hours"
            : "Picked up on the next supplier run, tomorrow morning",
          minDays: pickupDays,
          maxDays: pickupDays,
          cents: COURIER_CENTS,
        }
      : level === "freight"
        ? {
            method: "Freight, curbside delivery",
            carrier: "Interstate Freight",
            handling: "Palletised and collected within one business day",
            minDays: 3 + pickupDays,
            maxDays: 6 + pickupDays,
            cents: EXPEDITED_GROUND_CENTS,
          }
        : {
            method: "Ground",
            carrier: "NorthStar Ground",
            handling: pickupDays === 0 ? "Ships same business day" : "Ships the next business day",
            minDays: 2 + pickupDays,
            maxDays: 4 + pickupDays,
            cents: GROUND_CENTS,
          };

  let shippingCents = plan.cents;
  if (level === "ground" && subtotalCents >= FREE_GROUND_THRESHOLD_CENTS) {
    shippingCents = 0;
    notes.push("Ground delivery is free on orders over $150.");
  }
  if (level === "freight") {
    notes.push("Curbside only. Someone must be present to receive the pallet.");
  }
  if (addressSource === "custom") {
    notes.push("Delivering to a one-off address for this order, not the address on the account.");
  }
  if (address.instructions) {
    notes.push(`Delivery note passed to the driver: ${address.instructions}`);
  }
  if (product.core && product.core > 0) {
    notes.push(
      `A $${product.core.toFixed(2)} core deposit is included in the price and refunded when the old unit is returned to ${supplier.name}.`,
    );
  }

  return {
    address_source: addressSource,
    ships_to: address,
    method: plan.method,
    carrier: plan.carrier,
    ship_from: `${supplier.name}, ${supplier.address}`,
    handling_time: plan.handling,
    estimated_delivery: deliveryWindow({ from: now, minBusinessDays: plan.minDays, maxBusinessDays: plan.maxDays }),
    shipping_cents: shippingCents,
    currency: "USD",
    ...(notes.length ? { notes } : {}),
  };
}
