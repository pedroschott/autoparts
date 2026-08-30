import { Suspense } from "react";
import { OrdersView } from "@/components/OrdersView";

export const metadata = { title: "Orders — PartsRoute" };

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-3 py-6 md:px-5">
      <h1 className="mb-4 text-2xl font-bold">Orders</h1>
      <Suspense fallback={<div className="text-ink-500">Loading orders…</div>}>
        <OrdersView />
      </Suspense>
    </div>
  );
}
