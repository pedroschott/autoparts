"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { money, productById } from "@/lib/products";
import { supplierById } from "@/lib/suppliers";
import { FREE_SHIP_OVER, totals } from "@/lib/totals";
import { Trash, Truck } from "./icons";
import { ProductImage } from "./ProductImage";

export function CartView() {
  const { lines, setQty, remove, clear, count } = useCart();
  const t = totals(lines);

  if (count === 0) {
    return (
      <div className="rounded-lg border border-ink-300 bg-white px-6 py-16 text-center">
        <p className="text-lg font-semibold">Your cart is empty</p>
        <p className="mt-1 text-sm text-ink-500">
          Search for a part and add it here to compare suppliers before you order.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-md bg-brand-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900"
        >
          Browse parts
        </Link>
      </div>
    );
  }

  const groups = Object.entries(
    lines.reduce<Record<string, typeof lines>>((acc, line) => {
      const p = productById[line.productId];
      if (!p) return acc;
      (acc[p.supplierId] ||= []).push(line);
      return acc;
    }, {})
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        {groups.map(([supplierId, group]) => {
          const supplier = supplierById[supplierId];
          return (
            <section key={supplierId} className="rounded-lg border border-ink-300 bg-white">
              <header className="flex flex-wrap items-center gap-2 border-b border-ink-100 px-4 py-3">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: supplier.accent }}
                />
                <h2 className="text-sm font-bold">{supplier.name}</h2>
                <span className="flex items-center gap-1.5 text-xs text-ink-500">
                  <Truck className="h-4 w-4" />
                  {supplier.eta}
                </span>
              </header>

              <ul className="divide-y divide-ink-100">
                {group.map((line) => {
                  const p = productById[line.productId];
                  return (
                    <li key={line.productId} className="flex gap-4 p-4">
                      <Link
                        href={`/product/${p.id}`}
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded border border-ink-100 bg-white"
                      >
                        <ProductImage src={p.image} alt={p.name} sizes="80px" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
                          {p.brand}
                        </p>
                        <Link
                          href={`/product/${p.id}`}
                          className="text-[15px] font-semibold hover:text-brand-700 hover:underline"
                        >
                          {p.name}
                        </Link>
                        <p className="text-xs text-ink-500">
                          Part # {p.partNumber}
                          {p.position && ` · ${p.position}`}
                        </p>
                        {p.core !== undefined && (
                          <p className="text-xs text-ink-500">
                            + {money(p.core)} core charge each
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-3">
                          <input
                            type="number"
                            min={1}
                            value={line.qty}
                            onChange={(e) => setQty(p.id, Number(e.target.value))}
                            aria-label={`Quantity for ${p.name}`}
                            className="h-9 w-16 rounded-md border border-ink-300 px-2 text-sm font-semibold outline-none focus:border-brand-600"
                          />
                          <button
                            onClick={() => remove(p.id)}
                            className="flex items-center gap-1 text-xs font-semibold text-ink-500 transition hover:text-red-600"
                          >
                            <Trash className="h-4 w-4" /> Remove
                          </button>
                        </div>
                      </div>
                      <p className="shrink-0 text-lg font-bold">
                        {money((p.price + (p.core ?? 0)) * line.qty)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <button
          onClick={clear}
          className="text-sm font-semibold text-ink-500 transition hover:text-red-600"
        >
          Clear cart
        </button>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border border-ink-300 bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide">Order summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Subtotal ({count} items)</dt>
              <dd className="font-semibold">{money(t.subtotal)}</dd>
            </div>
            {t.core > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-500">Core charges</dt>
                <dd className="font-semibold">{money(t.core)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink-500">Shipping</dt>
              <dd className="font-semibold">
                {t.shipping === 0 ? "Free" : money(t.shipping)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Estimated tax</dt>
              <dd className="font-semibold">{money(t.tax)}</dd>
            </div>
          </dl>
          <div className="mt-3 flex items-baseline justify-between border-t border-ink-100 pt-3">
            <span className="font-bold">Total</span>
            <span className="text-2xl font-bold">{money(t.total)}</span>
          </div>
          {t.shipping > 0 && (
            <p className="mt-2 text-xs text-ink-500">
              Add {money(FREE_SHIP_OVER - t.subtotal)} more for free shipping.
            </p>
          )}
          <Link
            href="/checkout"
            className="mt-4 block rounded-md bg-brand-700 py-3 text-center text-sm font-bold text-white transition hover:bg-brand-900"
          >
            Proceed to checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
