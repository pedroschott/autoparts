import { CartView } from "@/components/CartView";

export const metadata = { title: "Cart — PartsRoute" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-3 py-6 md:px-5">
      <h1 className="mb-4 text-2xl font-bold">Your cart</h1>
      <CartView />
    </div>
  );
}
