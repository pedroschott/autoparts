import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AGENTPAY_CATEGORIES, agentPayCategory, agentPayPriceCents } from "@/lib/agentpay";
import { products } from "@/lib/products";
import { fleetVehicles, suppliers, vehicles } from "@/lib/suppliers";

/**
 * The catalog is a hand-written table, and every row of it is load-bearing:
 * a typo in a vehicle id silently hides a part from the only truck it fits,
 * and a category the slug map does not know falls through to "parts", which is
 * a mandate category no buyer ever authorised. These checks are cheap and they
 * are the ones a person adding a row will actually get wrong.
 */

const vehicleIds = new Set(vehicles.map((v) => v.id));
const supplierIds = new Set(suppliers.map((s) => s.id));

describe("catalog data", () => {
  it("has a unique id and a unique brand-and-part-number per row", () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    const partNumbers = products.map((p) => `${p.brand} ${p.partNumber}`);
    expect(new Set(partNumbers).size).toBe(partNumbers.length);
  });

  it("references a supplier, an artwork file and real vehicles on every row", () => {
    for (const p of products) {
      expect(supplierIds, p.id).toContain(p.supplierId);
      expect(existsSync(`public${p.image}`), `${p.id} artwork ${p.image}`).toBe(true);
      expect(p.fits.length, `${p.id} fitment`).toBeGreaterThan(0);
      for (const fit of p.fits) expect(vehicleIds, `${p.id} fitment`).toContain(fit);
    }
  });

  it("prices every row below list and quotes the agent the same number", () => {
    for (const p of products) {
      expect(p.price, p.id).toBeLessThan(p.listPrice);
      expect(agentPayPriceCents(p), p.id).toBe(Math.round((p.price + (p.core ?? 0)) * 100));
    }
  });

  it("maps every storefront category to an advertised mandate category", () => {
    for (const p of products) {
      // "parts" is the fallback for an unmapped category: a mandate scoped to
      // the store's advertised list would never match it, so the purchase would
      // be refused with CATEGORY_NOT_IN_SCOPE and no obvious reason why.
      const slug = agentPayCategory(p);
      expect(slug, `${p.id} (${p.category})`).not.toBe("parts");
      expect(AGENTPAY_CATEGORIES, p.id).toContain(slug);
    }
  });

  it("stocks every fleet unit with parts for its failure mode", () => {
    expect(fleetVehicles.map((v) => v.unit)).toEqual([
      "VAN-17",
      "VAN-22",
      "TRUCK-08",
      "TRUCK-12",
      "BOX-03",
      "BOX-07",
    ]);

    // The demo is a dispatcher with one unit down, so every unit needs enough
    // depth to compare on, across more than one system.
    for (const vehicle of fleetVehicles) {
      const fits = products.filter((p) => p.fits.includes(vehicle.id));
      expect(fits.length, vehicle.unit).toBeGreaterThanOrEqual(15);
      expect(fits.filter((p) => p.stock > 0).length, vehicle.unit).toBeGreaterThanOrEqual(15);
      expect(new Set(fits.map((p) => p.category)).size, vehicle.unit).toBeGreaterThanOrEqual(5);
    }

    // The failure each unit is demoed on, and the system that has to answer it.
    const failures: [string, string][] = [
      ["VAN-17", "Wheels & Tires"],
      ["VAN-22", "Electrical"],
      ["TRUCK-08", "Wheels & Tires"],
      ["TRUCK-12", "Brakes"],
      ["BOX-03", "Cooling"],
      ["BOX-07", "Brakes"],
    ];
    for (const [unit, category] of failures) {
      const vehicle = fleetVehicles.find((v) => v.unit === unit)!;
      const fits = products.filter((p) => p.fits.includes(vehicle.id) && p.category === category);
      expect(fits.length, `${unit} ${category}`).toBeGreaterThanOrEqual(3);
    }
  });
});
