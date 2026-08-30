"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/products";
import { vehicles } from "@/lib/suppliers";
import type { Product, Supplier } from "@/lib/types";
import { Check, Truck } from "./icons";
import { ProductImage } from "./ProductImage";
import { Stars } from "./Stars";

export function ProductDetail({
  product,
  supplier,
}: {
  product: Product;
  supplier: Supplier;
}) {
  const { add, justAdded } = useCart();
  const [qty, setQty] = useState(1);
  const added = justAdded === product.id;
  const save = product.listPrice - product.price;
  const fits = vehicles.filter((v) => product.fits.includes(v.id));

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="rounded-lg border border-ink-300 bg-white p-5">
        <div className="grid gap-6 sm:grid-cols-[280px_minmax(0,1fr)]">
          <div className="relative h-64 w-full overflow-hidden rounded-md border border-ink-100 bg-white sm:h-72">
            <ProductImage src={product.image} alt={product.name} sizes="280px" priority />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-500">
              {product.brand}
            </p>
            <h1 className="mt-1 text-2xl font-bold leading-tight">{product.name}</h1>
            <div className="mt-2">
              <Stars rating={product.rating} reviews={product.reviews} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <dt className="text-ink-500">Part number</dt>
                <dd className="font-semibold">{product.partNumber}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Category</dt>
                <dd className="font-semibold">{product.subCategory}</dd>
              </div>
              {product.position && (
                <div>
                  <dt className="text-ink-500">Position</dt>
                  <dd className="font-semibold">{product.position}</dd>
                </div>
              )}
              <div>
                <dt className="text-ink-500">Warranty</dt>
                <dd className="font-semibold">{product.warranty}</dd>
              </div>
            </dl>

            <p className="mt-4 text-[15px] leading-relaxed text-ink-700">{product.description}</p>
          </div>
        </div>

        <section className="mt-6 border-t border-ink-100 pt-5">
          <h2 className="text-sm font-bold uppercase tracking-wide">Specifications</h2>
          <dl className="mt-3 grid gap-x-8 gap-y-0 sm:grid-cols-2">
            {product.specs.map((s) => (
              <div
                key={s.label}
                className="flex justify-between gap-4 border-b border-ink-100 py-2 text-sm"
              >
                <dt className="text-ink-500">{s.label}</dt>
                <dd className="text-right font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-6 border-t border-ink-100 pt-5">
          <h2 className="text-sm font-bold uppercase tracking-wide">Confirmed fitment</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {fits.map((v) => (
              <li
                key={v.id}
                className="flex items-center gap-2 rounded-full border border-ink-300 bg-ink-100/60 px-3 py-1 text-[13px]"
              >
                {v.unit && (
                  <span className="rounded bg-ink-300/60 px-1.5 text-[10px] font-bold tracking-wide text-ink-700">
                    {v.unit}
                  </span>
                )}
                {v.year} {v.make} {v.model} · {v.engine}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border border-ink-300 bg-white p-5">
          <p className="text-sm text-ink-500">Your price</p>
          <p className="text-4xl font-bold tracking-tight">{money(product.price)}</p>
          {save > 0 && (
            <p className="mt-1 text-sm text-ink-500">
              List <span className="line-through">{money(product.listPrice)}</span>{" "}
              <span className="font-semibold text-stock">Save {money(save)}</span>
            </p>
          )}
          {product.core !== undefined && (
            <p className="mt-1 text-sm text-ink-500">
              + {money(product.core)} refundable core charge
            </p>
          )}

          <p
            className={`mt-4 inline-flex rounded-md px-2.5 py-1 text-[13px] font-bold ${
              product.stock > 0 ? "bg-stock/10 text-stock" : "bg-ink-100 text-ink-500"
            }`}
          >
            {product.stock > 0 ? `In stock — ${product.stock} available` : "Special order"}
          </p>

          <div className="mt-4 rounded-md border border-ink-100 bg-ink-100/50 p-3 text-[13px]">
            <p className="flex items-center gap-2 font-semibold">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: supplier.accent }}
              />
              {supplier.name}
            </p>
            <p className="mt-1 text-ink-500">{supplier.address}</p>
            <p className="mt-1 flex items-center gap-1.5 text-ink-700">
              <Truck className="h-4 w-4" /> {supplier.eta} · {supplier.distanceMi} mi away
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              aria-label="Quantity"
              className="h-11 w-20 rounded-md border border-ink-300 px-3 text-sm font-semibold outline-none focus:border-brand-600"
            />
            <button
              onClick={() => add(product.id, qty)}
              className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-md text-sm font-bold text-white transition ${
                added ? "bg-stock" : "bg-brand-700 hover:bg-brand-900"
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" /> Added to cart
                </>
              ) : (
                "Add to cart"
              )}
            </button>
          </div>

          <Link
            href="/checkout"
            onClick={() => add(product.id, qty)}
            className="mt-2 block rounded-md border border-brand-700 py-2.5 text-center text-sm font-bold text-brand-700 transition hover:bg-brand-100"
          >
            Buy now
          </Link>
        </div>
      </div>
    </div>
  );
}
