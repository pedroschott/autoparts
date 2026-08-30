"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/products";
import { supplierById } from "@/lib/suppliers";
import type { Product } from "@/lib/types";
import { Check, Truck } from "./icons";
import { ProductImage } from "./ProductImage";
import { StockBadge } from "./StockBadge";
import { Stars } from "./Stars";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const { add, justAdded } = useCart();
  const [qty, setQty] = useState(1);
  const supplier = supplierById[product.supplierId];
  const added = justAdded === product.id;
  const save = product.listPrice - product.price;

  return (
    <article className="rounded-lg border border-ink-300 bg-white p-4 transition hover:border-brand-600/60 hover:shadow-sm">
      <div className="flex gap-4">
        <Link
          href={`/product/${product.id}`}
          className="relative h-28 w-28 shrink-0 overflow-hidden rounded-md bg-white sm:h-32 sm:w-32"
        >
          <ProductImage
            src={product.image}
            alt={product.name}
            sizes="128px"
            priority={priority}
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
              {product.brand}
            </p>
            <h3 className="mt-0.5 text-[17px] font-semibold leading-snug">
              <Link href={`/product/${product.id}`} className="hover:text-brand-700 hover:underline">
                {product.name}
              </Link>
            </h3>

            <p className="mt-1 text-[13px] text-ink-500">
              Part # <span className="font-semibold text-ink-700">{product.partNumber}</span>
              {product.position && <> · {product.position}</>}
              {" · "}
              {product.subCategory}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <StockBadge stock={product.stock} supplier={supplier} />
              <Stars rating={product.rating} reviews={product.reviews} />
            </div>

            <p className="mt-2 flex items-center gap-1.5 text-[13px] text-ink-700">
              <Truck className="h-4 w-4 text-ink-500" />
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: supplier.accent }}
              />
              {supplier.name} · {supplier.distanceMi} mi · {supplier.eta}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 sm:w-52 sm:items-end">
            <div className="sm:text-right">
              <p className="text-[13px] text-ink-500">Your price</p>
              <p className="text-[27px] font-bold leading-none tracking-tight">
                {money(product.price)}
              </p>
              {save > 0 && (
                <p className="mt-1 text-xs text-ink-500">
                  List <span className="line-through">{money(product.listPrice)}</span>{" "}
                  <span className="font-semibold text-stock">Save {money(save)}</span>
                </p>
              )}
              {product.core !== undefined && (
                <p className="text-xs text-ink-500">+ {money(product.core)} core charge</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor={`qty-${product.id}`}>
                Quantity
              </label>
              <select
                id={`qty-${product.id}`}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="h-10 rounded-md border border-ink-300 bg-white px-2 text-sm font-semibold outline-none focus:border-brand-600"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <button
                onClick={() => add(product.id, qty)}
                className={`flex h-10 items-center justify-center gap-1.5 rounded-md px-5 text-sm font-bold text-white transition ${
                  added ? "bg-stock" : "bg-brand-700 hover:bg-brand-900"
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" /> Added
                  </>
                ) : (
                  "Add to cart"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
