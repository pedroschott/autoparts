import { products } from "@/lib/products";
import { suppliers } from "@/lib/suppliers";
import { Truck } from "@/components/icons";

export const metadata = { title: "Suppliers — PartsRoute" };

export default function SuppliersPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-3 py-6 md:px-5">
      <h1 className="text-2xl font-bold">Connected suppliers</h1>
      <p className="mt-1 text-sm text-ink-500">
        Every search checks live availability and your negotiated pricing at each of these locations.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((s) => {
          const count = products.filter((p) => p.supplierId === s.id).length;
          const inStock = products.filter((p) => p.supplierId === s.id && p.stock > 0).length;
          return (
            <section key={s.id} className="rounded-lg border border-ink-300 bg-white p-4">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ background: s.accent }}
                />
                <h2 className="text-[15px] font-bold">{s.name}</h2>
              </div>
              <p className="mt-1 text-[13px] text-ink-500">{s.address}</p>
              <dl className="mt-3 space-y-1.5 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-ink-500">Distance</dt>
                  <dd className="font-semibold">{s.distanceMi} mi</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-500">Catalog lines</dt>
                  <dd className="font-semibold">{count}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-500">In stock now</dt>
                  <dd className="font-semibold text-stock">{inStock}</dd>
                </div>
              </dl>
              <p className="mt-3 flex items-center gap-1.5 border-t border-ink-100 pt-3 text-[13px] text-ink-700">
                <Truck className="h-4 w-4 text-ink-500" />
                Next delivery {s.eta}
              </p>
            </section>
          );
        })}
      </div>
    </div>
  );
}
