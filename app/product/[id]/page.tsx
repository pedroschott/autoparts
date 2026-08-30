import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { money, productById, products } from "@/lib/products";
import { supplierById } from "@/lib/suppliers";
import { CURRENCY, MERCHANT_ID, MERCHANT_NAME, agentPayCategory, agentPayPriceCents, productPath } from "@/lib/agentpay";
import { ProductDetail } from "@/components/ProductDetail";
import { ProductCard } from "@/components/ProductCard";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

// An agent that lands here without calling the catalog still finds the exact
// values a purchase needs: the product id, merchant id, mandate category and
// the AgentPay quote, in <meta> tags and JSON-LD. They come from the same
// functions as the catalog and the checkout, so the three never disagree.
export async function generateMetadata({ params }: PageProps<"/product/[id]">): Promise<Metadata> {
  const { id } = await params;
  const p = productById[id];
  if (!p) return { title: "Part not found — PartsRoute" };
  return {
    title: `${p.brand} ${p.name} (${p.partNumber}) — ${money(p.price)} | PartsRoute`,
    description: p.description,
    other: {
      "agentpay:merchant_id": MERCHANT_ID,
      "agentpay:product_id": p.id,
      "agentpay:category": agentPayCategory(p),
      "agentpay:price_cents": String(agentPayPriceCents(p)),
      "agentpay:currency": CURRENCY,
      "agentpay:manifest": "/.well-known/agentpay.json",
    },
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
  const quoteCents = agentPayPriceCents(product);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    productID: product.id,
    sku: product.partNumber,
    mpn: product.partNumber,
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description,
    category: product.category,
    url: productPath(product),
    offers: [
      {
        "@type": "Offer",
        url: productPath(product),
        price: product.price.toFixed(2),
        priceCurrency: "USD",
        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        seller: { "@type": "Organization", name: supplier.name },
      },
      {
        "@type": "Offer",
        name: "AgentPay quote",
        url: productPath(product),
        price: (quoteCents / 100).toFixed(2),
        priceCurrency: CURRENCY,
        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        seller: { "@type": "Organization", name: MERCHANT_NAME, identifier: MERCHANT_ID },
      },
    ],
    additionalProperty: [
      { "@type": "PropertyValue", name: "agentpay:merchant_id", value: MERCHANT_ID },
      { "@type": "PropertyValue", name: "agentpay:product_id", value: product.id },
      { "@type": "PropertyValue", name: "agentpay:category", value: agentPayCategory(product) },
      { "@type": "PropertyValue", name: "agentpay:price_cents", value: quoteCents },
      { "@type": "PropertyValue", name: "agentpay:currency", value: CURRENCY },
    ],
  };

  return (
    <div className="mx-auto max-w-[1200px] px-3 py-5 md:px-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
