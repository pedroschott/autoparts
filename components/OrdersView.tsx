"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { money, productById } from "@/lib/products";
import { supplierById } from "@/lib/suppliers";
import type { CartLine } from "@/lib/types";
import { Check } from "./icons";

type Order = {
  id: string;
  placedAt: string;
  lines: CartLine[];
  totals: { subtotal: number; core: number; shipping: number; tax: number; total: number };
};

export function OrdersView() {
  const placed = useSearchParams().get("placed");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      setOrders(JSON.parse(localStorage.getItem("partsroute.orders.v1") ?? "[]"));
    } catch {}
  }, []);

  return (
    <div className="space-y-4">
      {placed && (
        <div className="flex items-start gap-3 rounded-lg border border-stock/30 bg-stock/5 p-4">
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-stock" />
          <div>
            <p className="font-bold text-stock">Order {placed} confirmed</p>
            <p className="text-sm text-ink-700">
              Your supplier has been notified. You will get a delivery window by email shortly.
            </p>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-lg border border-ink-300 bg-white px-6 py-16 text-center">
          <p className="text-lg font-semibold">No orders yet</p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-md bg-brand-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900"
          >
            Browse parts
          </Link>
        </div>
      ) : (
        orders.map((o) => (
          <section key={o.id} className="rounded-lg border border-ink-300 bg-white">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 px-4 py-3">
              <div>
                <p className="font-bold">{o.id}</p>
                <p className="text-xs text-ink-500">
                  Placed {new Date(o.placedAt).toLocaleString("en-US")}
                </p>
              </div>
              <p className="text-lg font-bold">{money(o.totals.total)}</p>
            </header>
            <ul className="divide-y divide-ink-100">
              {o.lines.map((l) => {
                const p = productById[l.productId];
                if (!p) return null;
                return (
                  <li key={l.productId} className="flex justify-between gap-4 px-4 py-3 text-sm">
                    <span className="min-w-0">
                      <Link
                        href={`/product/${p.id}`}
                        className="font-semibold hover:text-brand-700 hover:underline"
                      >
                        {p.name}
                      </Link>
                      <span className="block text-xs text-ink-500">
                        {p.brand} · {p.partNumber} · {supplierById[p.supplierId].name}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-ink-500">Qty {l.qty}</span>
                      <span className="font-semibold">
                        {money((p.price + (p.core ?? 0)) * l.qty)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
