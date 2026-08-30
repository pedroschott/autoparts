import { productById } from "./products";
import type { CartLine } from "./types";

export const TAX_RATE = 0.08875;
export const FREE_SHIP_OVER = 199;
export const SHIPPING_FLAT = 14.95;

export function totals(lines: CartLine[]) {
  const subtotal = lines.reduce((a, l) => {
    const p = productById[l.productId];
    return a + (p ? p.price * l.qty : 0);
  }, 0);
  const core = lines.reduce((a, l) => {
    const p = productById[l.productId];
    return a + (p?.core ?? 0) * l.qty;
  }, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIP_OVER ? 0 : SHIPPING_FLAT;
  const tax = (subtotal + core) * TAX_RATE;
  const total = subtotal + core + shipping + tax;
  return { subtotal, core, shipping, tax, total };
}
