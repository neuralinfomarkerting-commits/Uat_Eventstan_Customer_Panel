export default function DiscountBadge({
  original,
  current,
}: {
  original: number;
  current: number;
}) {
  const pct = Math.round(((original - current) / original) * 100);
  return (
    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
      {pct}% OFF
    </span>
  );
}