"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { money, productById } from "@/lib/products";
import { totals } from "@/lib/totals";
import { Check } from "./icons";

const FIELDS = [
  { name: "name", label: "Full name", placeholder: "Alex Morgan", span: 2 },
  { name: "email", label: "Email", placeholder: "alex@shopmail.com", span: 2, type: "email" },
  { name: "address", label: "Street address", placeholder: "480 Grand Concourse", span: 2 },
  { name: "city", label: "City", placeholder: "Bronx", span: 1 },
  { name: "state", label: "State", placeholder: "NY", span: 1 },
  { name: "zip", label: "ZIP code", placeholder: "10451", span: 1 },
  { name: "phone", label: "Phone", placeholder: "(212) 555-0148", span: 1 },
] as const;

export function CheckoutView() {
  const { lines, count, clear } = useCart();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const t = totals(lines);

  if (count === 0) {
    return (
      <div className="rounded-lg border border-ink-300 bg-white px-6 py-16 text-center">
        <p className="text-lg font-semibold">There is nothing to check out</p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-md bg-brand-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900"
        >
          Browse parts
        </Link>
      </div>
    );
  }

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    const order = {
      id: `PR-${Math.floor(100000 + Math.random() * 899999)}`,
      placedAt: new Date().toISOString(),
      lines,
      totals: t,
    };
    try {
      const prev = JSON.parse(localStorage.getItem("partsroute.orders.v1") ?? "[]");
      localStorage.setItem("partsroute.orders.v1", JSON.stringify([order, ...prev]));
    } catch {}
    clear();
    router.push(`/orders?placed=${order.id}`);
  };

  return (
    <form onSubmit={placeOrder} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <section className="rounded-lg border border-ink-300 bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide">Shipping details</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {FIELDS.map((f) => (
              <label
                key={f.name}
                className={f.span === 2 ? "col-span-2 block" : "col-span-2 block sm:col-span-1"}
              >
                <span className="mb-1 block text-[13px] font-semibold text-ink-700">{f.label}</span>
                <input
                  required
                  name={f.name}
                  type={"type" in f ? f.type : "text"}
                  placeholder={f.placeholder}
                  className="h-11 w-full rounded-md border border-ink-300 px-3 text-sm outline-none transition placeholder:text-ink-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-ink-300 bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide">Payment</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <label className="col-span-2 block">
              <span className="mb-1 block text-[13px] font-semibold text-ink-700">Card number</span>
              <input
                required
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                className="h-11 w-full rounded-md border border-ink-300 px-3 text-sm outline-none transition placeholder:text-ink-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="col-span-2 block sm:col-span-1">
              <span className="mb-1 block text-[13px] font-semibold text-ink-700">Expiry</span>
              <input
                required
                placeholder="04 / 29"
                className="h-11 w-full rounded-md border border-ink-300 px-3 text-sm outline-none transition placeholder:text-ink-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="col-span-2 block sm:col-span-1">
              <span className="mb-1 block text-[13px] font-semibold text-ink-700">
                Security code
              </span>
              <input
                required
                placeholder="123"
                className="h-11 w-full rounded-md border border-ink-300 px-3 text-sm outline-none transition placeholder:text-ink-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </label>
          </div>
          <p className="mt-3 text-xs text-ink-500">
            This is a demo storefront. No card is charged and no details are transmitted.
          </p>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border border-ink-300 bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide">Order summary</h2>
          <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto thin-scroll text-sm">
            {lines.map((l) => {
              const p = productById[l.productId];
              return (
                <li key={l.productId} className="flex justify-between gap-3">
                  <span className="min-w-0 flex-1 truncate text-ink-700">
                    {l.qty} × {p.name}
                  </span>
                  <span className="shrink-0 font-semibold">
                    {money((p.price + (p.core ?? 0)) * l.qty)}
                  </span>
                </li>
              );
            })}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-ink-100 pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Subtotal</dt>
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
          <button
            type="submit"
            disabled={placing}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-brand-700 py-3 text-sm font-bold text-white transition hover:bg-brand-900 disabled:opacity-60"
          >
            {placing ? "Placing order…" : (<><Check className="h-4 w-4" /> Place order</>)}
          </button>
        </div>
      </aside>
    </form>
  );
}
