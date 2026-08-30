import { Suspense } from "react";
import { SearchResults } from "@/components/SearchResults";

export default function Home() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-ink-500">Loading parts…</div>}>
      <SearchResults />
    </Suspense>
  );
}
