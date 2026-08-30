"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { money, products } from "@/lib/products";
import { suppliers, vehicleFull } from "@/lib/suppliers";
import { useVehicle } from "@/lib/vehicle";
import type { Product } from "@/lib/types";
import { Book, ChevronRight, Store, Truck } from "./icons";
import { CartPanel } from "./CartPanel";
import { ProductCard } from "./ProductCard";

type SortKey = "relevance" | "price-asc" | "price-desc" | "rating" | "distance";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "Best match" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "rating", label: "Customer rating" },
  { key: "distance", label: "Closest supplier" },
];

function matches(p: Product, q: string) {
  if (!q) return true;
  const hay = `${p.name} ${p.brand} ${p.partNumber} ${p.category} ${p.subCategory}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => hay.includes(term));
}

export function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const { vehicle } = useVehicle();

  const q = params.get("q") ?? "";
  const [tab, setTab] = useState<"aftermarket" | "dealers">("aftermarket");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [activeSupplier, setActiveSupplier] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [activeBrands, setActiveBrands] = useState<string[]>([]);
  const [fitmentOnly, setFitmentOnly] = useState(true);

  // Results before the supplier / sub-category facets, so the facet counts
  // reflect what selecting them would actually produce.
  const base = useMemo(
    () =>
      products.filter((p) => {
        if (!matches(p, q)) return false;
        if (fitmentOnly && !p.fits.includes(vehicle.id)) return false;
        if (inStockOnly && p.stock <= 0) return false;
        if (activeBrands.length && !activeBrands.includes(p.brand)) return false;
        if (tab === "dealers") return p.brand === "ACDelco" || p.brand === "Denso" || p.brand === "Bosch";
        return true;
      }),
    [q, vehicle.id, fitmentOnly, inStockOnly, activeBrands, tab]
  );

  const supplierCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of base) counts[p.supplierId] = (counts[p.supplierId] ?? 0) + 1;
    return counts;
  }, [base]);

  const subCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of base) counts[p.subCategory] = (counts[p.subCategory] ?? 0) + 1;
    return counts;
  }, [base]);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      if (!matches(p, q)) continue;
      if (fitmentOnly && !p.fits.includes(vehicle.id)) continue;
      counts[p.brand] = (counts[p.brand] ?? 0) + 1;
    }
    return counts;
  }, [q, fitmentOnly, vehicle.id]);

  const results = useMemo(() => {
    const list = base.filter(
      (p) =>
        (!activeSupplier || p.supplierId === activeSupplier) &&
        (!activeSub || p.subCategory === activeSub)
    );
    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
        break;
      case "distance":
        sorted.sort((a, b) => {
          const da = suppliers.find((s) => s.id === a.supplierId)!.distanceMi;
          const db = suppliers.find((s) => s.id === b.supplierId)!.distanceMi;
          return da - db;
        });
        break;
      default:
        sorted.sort((a, b) => b.rating * b.reviews - a.rating * a.reviews);
    }
    return sorted;
  }, [base, activeSupplier, activeSub, sort]);

  const priceRange = results.length
    ? [Math.min(...results.map((p) => p.price)), Math.max(...results.map((p) => p.price))]
    : null;

  const toggleBrand = (b: string) =>
    setActiveBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));

  const clearAll = () => {
    setActiveSupplier(null);
    setActiveSub(null);
    setActiveBrands([]);
    setInStockOnly(false);
    setFitmentOnly(true);
  };

  const filterCount =
    (activeSupplier ? 1 : 0) + (activeSub ? 1 : 0) + activeBrands.length + (inStockOnly ? 1 : 0);

  const subEntries = Object.entries(subCounts).sort((a, b) => b[1] - a[1]);
  const brandEntries = Object.entries(brandCounts).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="mx-auto max-w-[1600px] px-3 py-4 md:px-5">
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_320px]">
        {/* ---------------- Left facet rail ---------------- */}
        <div className="hidden lg:block">
          <div className="sticky top-24 space-y-3">
            <section className="rounded-lg border border-ink-300 bg-white">
              <div className="flex items-center justify-between border-b border-ink-100 px-3.5 py-2.5">
                <h2 className="text-[13px] font-bold uppercase tracking-wide">Filters</h2>
                {filterCount > 0 && (
                  <button onClick={clearAll} className="text-xs font-semibold text-brand-700 hover:underline">
                    Clear ({filterCount})
                  </button>
                )}
              </div>

              <div className="space-y-2.5 border-b border-ink-100 px-3.5 py-3 text-sm">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={fitmentOnly}
                    onChange={(e) => setFitmentOnly(e.target.checked)}
                    className="h-4 w-4 accent-[var(--color-brand-700)]"
                  />
                  Fits my vehicle
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="h-4 w-4 accent-[var(--color-brand-700)]"
                  />
                  In stock only
                </label>
              </div>

              <div className="border-b border-ink-100 px-3.5 py-3">
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                  Add part type
                </h3>
                <ul className="max-h-64 space-y-0.5 overflow-y-auto thin-scroll text-[13px]">
                  {subEntries.map(([sub, n]) => (
                    <li key={sub}>
                      <button
                        onClick={() => setActiveSub(activeSub === sub ? null : sub)}
                        className={`flex w-full items-center justify-between gap-2 rounded px-1.5 py-1 text-left transition hover:bg-ink-100 ${
                          activeSub === sub ? "font-bold text-brand-700" : "text-ink-700"
                        }`}
                      >
                        <span className="truncate">{sub}</span>
                        <span className="shrink-0 text-[11px] text-ink-500">{n}</span>
                      </button>
                    </li>
                  ))}
                  {!subEntries.length && <li className="px-1.5 py-1 text-ink-500">No part types</li>}
                </ul>
              </div>

              <div className="px-3.5 py-3">
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                  Brand
                </h3>
                <ul className="max-h-56 space-y-0.5 overflow-y-auto thin-scroll text-[13px]">
                  {brandEntries.map(([b, n]) => (
                    <li key={b}>
                      <label className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 transition hover:bg-ink-100">
                        <input
                          type="checkbox"
                          checked={activeBrands.includes(b)}
                          onChange={() => toggleBrand(b)}
                          className="h-3.5 w-3.5 accent-[var(--color-brand-700)]"
                        />
                        <span className="flex-1 truncate">{b}</span>
                        <span className="text-[11px] text-ink-500">{n}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {priceRange && (
              <section className="rounded-lg border border-ink-300 bg-white px-3.5 py-3 text-sm">
                <h3 className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
                  Price range
                </h3>
                <p className="mt-1 font-semibold">
                  {money(priceRange[0])} – {money(priceRange[1])}
                </p>
              </section>
            )}
          </div>
        </div>

        {/* ---------------- Center column ---------------- */}
        <div className="min-w-0 space-y-3">
          <section className="rounded-lg border border-ink-300 bg-white p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-2">
                {(["aftermarket", "dealers"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold capitalize transition ${
                      tab === t
                        ? "bg-brand-700 text-white"
                        : "border border-ink-300 bg-white text-ink-700 hover:bg-ink-100"
                    }`}
                  >
                    <Store className="h-4.5 w-4.5" />
                    {t}
                  </button>
                ))}
              </div>
              <Link
                href="/catalog"
                className="ml-auto flex items-center gap-2 rounded-md border border-ink-300 px-3.5 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-100"
              >
                <Book className="h-4.5 w-4.5" />
                PartsRoute Catalog
              </Link>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 thin-scroll">
              <button
                onClick={() => setActiveSupplier(null)}
                className={`w-[150px] shrink-0 rounded-lg border px-3 py-2.5 text-left transition ${
                  activeSupplier === null
                    ? "border-brand-700 bg-brand-100"
                    : "border-ink-300 bg-white hover:border-brand-600"
                }`}
              >
                <span className="block text-[13px] font-bold">All suppliers</span>
                <span className="mt-1 block text-[11px] text-ink-500">
                  {base.length} results
                </span>
              </button>

              {suppliers.map((s) => {
                const n = supplierCounts[s.id] ?? 0;
                const active = activeSupplier === s.id;
                return (
                  <button
                    key={s.id}
                    disabled={n === 0}
                    onClick={() => setActiveSupplier(active ? null : s.id)}
                    className={`relative w-[150px] shrink-0 rounded-lg border px-3 pb-2.5 pt-4 text-left transition ${
                      active
                        ? "border-brand-700 bg-brand-100"
                        : "border-ink-300 bg-white hover:border-brand-600"
                    } ${n === 0 ? "cursor-not-allowed opacity-45" : ""}`}
                  >
                    <span
                      className="absolute -top-2 left-1/2 grid h-6 min-w-6 -translate-x-1/2 place-items-center rounded-full border-2 border-white px-1.5 text-[11px] font-bold text-white"
                      style={{ background: s.accent }}
                    >
                      {n}
                    </span>
                    <span className="block truncate text-[13px] font-bold" style={{ color: s.accent }}>
                      {s.name}
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-ink-500">{s.address}</span>
                  </button>
                );
              })}

              <div className="grid shrink-0 place-items-center px-1 text-ink-500">
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-sm text-ink-700">
              <span className="font-bold">{results.length}</span> result
              {results.length === 1 ? "" : "s"}
              {q && (
                <>
                  {" "}for <span className="font-bold">&ldquo;{q}&rdquo;</span>
                </>
              )}{" "}
              <span className="text-ink-500">· {vehicleFull(vehicle)}</span>
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-ink-500">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-9 rounded-md border border-ink-300 bg-white px-2 text-sm font-semibold outline-none focus:border-brand-600"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {results.length === 0 ? (
            <div className="rounded-lg border border-ink-300 bg-white px-6 py-16 text-center">
              <p className="text-lg font-semibold">No parts matched this search</p>
              <p className="mt-1 text-sm text-ink-500">
                Try a broader term, clear your filters, or turn off the vehicle fitment filter.
              </p>
              <button
                onClick={() => {
                  clearAll();
                  setFitmentOnly(false);
                  router.push("/");
                }}
                className="mt-4 rounded-md bg-brand-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-900"
              >
                Reset search
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 3} />
              ))}
            </div>
          )}

          <p className="flex items-center justify-center gap-2 py-4 text-xs text-ink-500">
            <Truck className="h-4 w-4" />
            Live availability from {suppliers.length} local suppliers · prices in USD
          </p>
        </div>

        {/* ---------------- Right cart rail ---------------- */}
        <div className="hidden xl:block">
          <div className="sticky top-24">
            <CartPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
