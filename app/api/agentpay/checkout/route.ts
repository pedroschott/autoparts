import { NextResponse } from "next/server";
import { productById } from "@/lib/products";
import { TAX_RATE, FREE_SHIP_OVER, SHIPPING_FLAT } from "@/lib/totals";

const MERCHANT_ID = "partsroute-demo";

type Item = { productId: string; quantity: number };

type CheckoutRequest = {
  mandateId?: string;
  merchantId?: string;
  items?: Item[];
};

function refuse(reason: string, status = 400) {
  return NextResponse.json({ decision: "refused", reason }, { status });
}

/**
 * Merchant-side checkout route.
 *
 * Signature, nonce, mandate and revocation checks are the SDK's job — wrap this
 * handler with `@agentpay/merchant-sdk` once the credentials are in place. What
 * lives here is only what the merchant itself has to decide: does the cart
 * resolve, is it in stock, and what does it actually cost.
 */
export async function POST(request: Request) {
  let body: CheckoutRequest;
  try {
    body = await request.json();
  } catch {
    return refuse("invalid_json");
  }

  if (body.merchantId && body.merchantId !== MERCHANT_ID) {
    return refuse("merchant_mismatch");
  }
  if (!body.mandateId) {
    return refuse("missing_mandate");
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return refuse("empty_cart");
  }

  const resolved = [];
  for (const item of body.items) {
    const product = productById[item.productId];
    if (!product) return refuse(`unknown_product:${item.productId}`, 404);

    const quantity = Math.floor(item.quantity);
    if (!Number.isFinite(quantity) || quantity < 1) {
      return refuse(`invalid_quantity:${item.productId}`);
    }
    if (quantity > product.stock) {
      return NextResponse.json(
        {
          decision: "refused",
          reason: "insufficient_stock",
          productId: product.id,
          quantityAvailable: product.stock,
        },
        { status: 409 }
      );
    }

    resolved.push({
      productId: product.id,
      name: product.name,
      quantity,
      unitPriceCents: Math.round((product.price + (product.core ?? 0)) * 100),
    });
  }

  const subtotalCents = resolved.reduce((a, l) => a + l.unitPriceCents * l.quantity, 0);
  const shippingCents =
    subtotalCents >= FREE_SHIP_OVER * 100 ? 0 : Math.round(SHIPPING_FLAT * 100);
  const taxCents = Math.round(subtotalCents * TAX_RATE);

  return NextResponse.json({
    decision: "approved",
    merchantId: MERCHANT_ID,
    mandateId: body.mandateId,
    orderId: `PR-${Date.now().toString(36).toUpperCase()}`,
    currency: "USD",
    items: resolved,
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents: subtotalCents + shippingCents + taxCents,
  });
}
