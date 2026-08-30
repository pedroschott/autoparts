import Link from "next/link";
import { notFound } from "next/navigation";
import { money, productById, products } from "@/lib/products";
import { supplierById } from "@/lib/suppliers";
import { ProductDetail } from "@/components/ProductDetail";
import { ProductCard } from "@/components/ProductCard";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/product/[id]">) {
  const { id } = await params;
  const p = productById[id];
  if (!p) return { title: "Part not found — PartsRoute" };
  return {
    title: `${p.brand} ${p.name} (${p.partNumber}) — ${money(p.price)} | PartsRoute`,
    description: p.description,
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[id]">) {
  const { id } = await params;
  const product = productById[id];
  if (!product) notFound();

  const supplier = supplierById[product.supplierId];
  const related = products
    .filter((p) => p.subCategory === product.subCategory && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-[1200px] px-3 py-5 md:px-5">
      <nav className="mb-4 text-[13px] text-ink-500">
        <Link href="/" className="hover:text-brand-700 hover:underline">
          Search
        </Link>
        {" / "}
        <Link href={`/?q=${encodeURIComponent(product.category)}`} className="hover:text-brand-700 hover:underline">
          {product.category}
        </Link>
        {" / "}
        <span className="text-ink-700">{product.subCategory}</span>
      </nav>

      <ProductDetail product={product} supplier={supplier} />

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Other {product.subCategory} options</h2>
          <div className="space-y-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
