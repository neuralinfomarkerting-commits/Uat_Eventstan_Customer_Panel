interface CurrencySymbolProps {
  currency?: string;
  className?: string;
}

export default function CurrencySymbol({
  currency,
  className,
}: CurrencySymbolProps) {
  return <span className={className}>{currency ?? ""}</span>;
}