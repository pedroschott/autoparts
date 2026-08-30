import { Star } from "./icons";

export function Stars({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="flex items-center gap-1">
      <span className="flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i < Math.round(rating) ? "text-amber-500" : "text-ink-300"}`}
          />
        ))}
      </span>
      <span className="text-xs text-ink-500">
        {rating.toFixed(1)}
        {reviews !== undefined && ` (${reviews.toLocaleString("en-US")})`}
      </span>
    </span>
  );
}
