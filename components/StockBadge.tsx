"use client";

import { useState } from "react";
import { Chevron } from "./icons";
import type { Supplier } from "@/lib/types";

export function StockBadge({
  stock,
  supplier,
}: {
  stock: number;
  supplier: Supplier;
}) {
  const [open, setOpen] = useState(false);
  const inStock = stock > 0;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[13px] font-semibold transition ${
          inStock
            ? "border-stock/40 bg-stock/5 text-stock hover:bg-stock/10"
            : "border-ink-300 bg-ink-100 text-ink-500"
        }`}
      >
        {inStock ? "In Stock" : "Special Order"}
        <Chevron className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-60 rounded-lg border border-ink-300 bg-white p-3 text-sm shadow-xl">
          <p className="font-semibold">{supplier.name}</p>
          <p className="mt-0.5 text-xs text-ink-500">{supplier.address}</p>
          <dl className="mt-2.5 space-y-1 text-xs">
            <div className="flex justify-between">
              <dt className="text-ink-500">Quantity on hand</dt>
              <dd className="font-semibold">{stock}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Distance</dt>
              <dd className="font-semibold">{supplier.distanceMi} mi</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Delivery</dt>
              <dd className="font-semibold">{supplier.eta}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
