import CurrencySymbol from "@/components/ui/CurrencySymbol";

export default function Money({
  value,
  currency,
  className = "",
}: {
  value: number;
  currency: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-baseline gap-0.5 whitespace-nowrap ${className}`}
    >
      <CurrencySymbol currency={currency} className="leading-none" />
      <span>{value.toLocaleString()}</span>
    </span>
  );
}