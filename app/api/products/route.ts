import { NextResponse } from "next/server";
import { products } from "@/lib/products";
import { supplierById } from "@/lib/suppliers";

// Machine-readable catalog feed. Prices are in USD minor units so that
// downstream consumers never have to deal with float rounding.
export function GET() {
  return NextResponse.json({
    currency: "USD",
    count: products.length,
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
    })),
  });
}
