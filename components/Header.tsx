"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { useVehicle } from "@/lib/vehicle";
import { vehicleFull, vehicleLabel, vehicles } from "@/lib/suppliers";
import { Car, Cart, Chevron, Logo, Menu, Search } from "./icons";

const NAV = [
  { href: "/", label: "Search" },
  { href: "/catalog", label: "Catalog" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/orders", label: "Orders" },
];

function VehiclePicker() {
  const { vehicle, setVehicleId } = useVehicle();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center gap-2.5 rounded-md border border-ink-300 bg-white px-3 text-left transition hover:border-brand-600 md:w-[260px]"
      >
        <Car className="h-6 w-6 shrink-0 text-ink-700" />
        <span className="min-w-0 flex-1 truncate text-[15px] font-medium">
          {vehicleLabel(vehicle)}
        </span>
        <Chevron className={`h-4 w-4 shrink-0 text-ink-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-1.5 w-[320px] overflow-hidden rounded-lg border border-ink-300 bg-white shadow-xl">
          <p className="border-b border-ink-100 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Select a vehicle
          </p>
          <ul className="max-h-[340px] overflow-y-auto thin-scroll">
            {vehicles.map((v) => (
              <li key={v.id}>
                <button
                  onClick={() => {
                    setVehicleId(v.id);
                    setOpen(false);
                  }}
                  className={`block w-full px-3.5 py-2.5 text-left text-sm transition hover:bg-ink-100 ${
                    v.id === vehicle.id ? "bg-brand-100 font-semibold" : ""
                  }`}
                >
                  <span className="block">{vehicleLabel(v)}</span>
                  <span className="block text-xs text-ink-500">
                    {v.trim} · {v.engine}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="border-t border-ink-100 px-3.5 py-2 text-[11px] text-ink-500">
            Fitment shown for {vehicleFull(vehicle)}
          </p>
        </div>
      )}
    </div>
  );
}

function SearchBar() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    if (pathname === "/") setQ(params.get("q") ?? "");
  }, [params, pathname]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (q.trim()) next.set("q", q.trim());
    router.push(`/?${next.toString()}`);
  };

  return (
    <form onSubmit={submit} className="flex min-w-0 flex-1 items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by part name, brand or part number"
          aria-label="Search parts"
          className="h-11 w-full rounded-md border border-ink-300 bg-white pl-10 pr-3 text-[15px] outline-none transition placeholder:text-ink-500 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <button
        type="submit"
        className="h-11 shrink-0 rounded-md bg-brand-700 px-6 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-900"
      >
        Search
      </button>
    </form>
  );
}

export function Header() {
  const { count } = useCart();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-ink-300 bg-white">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-3 py-2.5 md:gap-4 md:px-5">
        <button
          onClick={() => setNavOpen((o) => !o)}
          aria-label="Menu"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-ink-700 transition hover:bg-ink-100"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Logo className="h-9 w-9" />
          <span className="hidden text-[19px] font-extrabold tracking-tight sm:block">
            Parts<span className="text-brand-700">Route</span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 md:flex">
          <Suspense fallback={<div className="h-11 flex-1" />}>
            <SearchBar />
          </Suspense>
        </div>

        <div className="hidden lg:block">
          <VehiclePicker />
        </div>

        <Link
          href="/cart"
          className="relative grid h-10 w-10 shrink-0 place-items-center rounded-md text-ink-700 transition hover:bg-ink-100"
          aria-label={`Cart, ${count} items`}
        >
          <Cart className="h-6 w-6" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-700 px-1 text-[11px] font-bold text-white">
              {count}
            </span>
          )}
        </Link>
      </div>

      <div className="border-t border-ink-100 px-3 py-2 md:hidden">
        <Suspense fallback={<div className="h-11" />}>
          <SearchBar />
        </Suspense>
        <div className="mt-2 lg:hidden">
          <VehiclePicker />
        </div>
      </div>

      {navOpen && (
        <nav className="border-t border-ink-100 bg-white">
          <ul className="mx-auto flex max-w-[1600px] gap-1 px-3 py-2 md:px-5">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setNavOpen(false)}
                  className={`block rounded-md px-3 py-1.5 text-sm font-semibold transition hover:bg-ink-100 ${
                    pathname === n.href ? "bg-brand-100 text-brand-700" : "text-ink-700"
                  }`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
