import Link from "next/link";
import { products, subCategoriesByCategory } from "@/lib/products";

export const metadata = { title: "Parts catalog — PartsRoute" };

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-3 py-6 md:px-5">
      <h1 className="text-2xl font-bold">Parts catalog</h1>
      <p className="mt-1 text-sm text-ink-500">
        Browse the full catalog by system, then drill into a part type to compare suppliers.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subCategoriesByCategory.map(({ category, subCategories }) => (
          <section key={category} className="rounded-lg border border-ink-300 bg-white p-4">
            <h2 className="text-[15px] font-bold">{category}</h2>
            <p className="text-xs text-ink-500">
              {products.filter((p) => p.category === category).length} parts
            </p>
            <ul className="mt-3 space-y-1">
              {subCategories.map((s) => (
                <li key={s}>
                  <Link
                    href={`/?q=${encodeURIComponent(s)}`}
                    className="text-[13px] text-ink-700 transition hover:text-brand-700 hover:underline"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
