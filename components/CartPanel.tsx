"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { money, productById } from "@/lib/products";
import { supplierById } from "@/lib/suppliers";
import { Cart as CartIcon, Trash } from "./icons";
import { ProductImage } from "./ProductImage";

export function CartPanel() {
  const { lines, subtotal, setQty, remove, count } = useCart();

  const groups = Object.entries(
    lines.reduce<Record<string, typeof lines>>((acc, line) => {
      const p = productById[line.productId];
      if (!p) return acc;
      (acc[p.supplierId] ||= []).push(line);
      return acc;
    }, {})
  );

  return (
    <aside className="rounded-lg border border-ink-300 bg-white">
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
        <h2 className="flex items-center gap-2 text-[15px] font-bold">
          <CartIcon className="h-5 w-5 text-ink-700" />
          Cart
          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-bold text-ink-700">
            {count}
          </span>
        </h2>
        {count > 0 && (
          <Link href="/cart" className="text-xs font-semibold text-brand-700 hover:underline">
            View cart
          </Link>
        )}
      </div>

      {count === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-ink-500">
          Your cart is empty. Add parts from the results to compare and order them together.
        </p>
      ) : (
        <>
          <div className="max-h-[420px] overflow-y-auto thin-scroll">
            {groups.map(([supplierId, group]) => {
              const supplier = supplierById[supplierId];
              return (
                <div key={supplierId} className="border-b border-ink-100 last:border-0">
                  <p className="flex items-center gap-2 bg-ink-100/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-700">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: supplier.accent }}
                    />
                    {supplier.name}
                  </p>
                  <ul>
                    {group.map((line) => {
                      const p = productById[line.productId];
                      return (
                        <li key={line.productId} className="flex gap-3 px-4 py-3">
                          <Link
                            href={`/product/${p.id}`}
                            className="relative h-14 w-14 shrink-0 overflow-hidden rounded border border-ink-100 bg-white"
                          >
                            <ProductImage src={p.image} alt={p.name} sizes="56px" />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold">{p.name}</p>
                            <p className="text-[11px] text-ink-500">
                              {p.brand} · {p.partNumber}
                            </p>
                            <div className="mt-1.5 flex items-center gap-2">
                              <input
                                type="number"
                                min={1}
                                value={line.qty}
                                onChange={(e) => setQty(p.id, Number(e.target.value))}
                                aria-label={`Quantity for ${p.name}`}
                                className="h-7 w-14 rounded border border-ink-300 px-1.5 text-xs font-semibold outline-none focus:border-brand-600"
                              />
                              <span className="text-[13px] font-bold">
                                {money((p.price + (p.core ?? 0)) * line.qty)}
                              </span>
                              <button
                                onClick={() => remove(p.id)}
                                aria-label={`Remove ${p.name}`}
                                className="ml-auto text-ink-500 transition hover:text-red-600"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="border-t border-ink-100 px-4 py-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink-500">Subtotal</span>
              <span className="text-xl font-bold">{money(subtotal)}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-ink-500">
              Shipping and tax calculated at checkout.
            </p>
            <Link
              href="/checkout"
              className="mt-3 block rounded-md bg-brand-700 py-2.5 text-center text-sm font-bold text-white transition hover:bg-brand-900"
            >
              Buy now
            </Link>
          </div>
        </>
      )}
    </aside>
  );
}
