import { NextResponse } from "next/server";
import { products } from "@/lib/products";
import { supplierById } from "@/lib/suppliers";
import {
  AGENTPAY_CATEGORIES,
  CURRENCY,
  MERCHANT_ID,
  agentPayCategory,
  agentPayPriceCents,
} from "@/lib/agentpay";

// Machine-readable catalog feed. Prices are in minor units so that downstream
// consumers never have to deal with float rounding.
//
// Two prices, deliberately. `priceCents` is the USD a person pays on the
// storefront. `agentpayPriceCents` is the same part quoted in the currency
// mandates are denominated in, which is what the policy engine checks the
// mandate limits against — the two differ whenever AGENTPAY_CURRENCY is not the
// store currency. Both, plus the coarse category a mandate has to be scoped to,
// come from lib/agentpay.ts, so the feed can never advertise a price the
// checkout route would not honour.
export function GET() {
  return NextResponse.json({
    currency: "USD",
    count: products.length,
    agentpay: {
      merchant_id: MERCHANT_ID,
      manifest: "/.well-known/agentpay.json",
      currency: CURRENCY,
      categories: AGENTPAY_CATEGORIES,
    },
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      partNumber: p.partNumber,
      category: p.category,
      subCategory: p.subCategory,
      priceCents: Math.round(p.price * 100),
      coreChargeCents: p.core ? Math.round(p.core * 100) : 0,
      inStock: p.stock > 0,
      quantityAvailable: p.stock,
      supplier: supplierById[p.supplierId].name,
      url: `/product/${p.id}`,
      agentpayCategory: agentPayCategory(p),
      agentpayPriceCents: agentPayPriceCents(p),
    })),
  });
}
