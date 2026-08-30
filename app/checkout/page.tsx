import { CheckoutView } from "@/components/CheckoutView";

export const metadata = { title: "Checkout — PartsRoute" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-3 py-6 md:px-5">
      <h1 className="mb-4 text-2xl font-bold">Checkout</h1>
      <CheckoutView />
    </div>
  );
}
