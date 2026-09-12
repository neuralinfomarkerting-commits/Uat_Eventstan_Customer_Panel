export default function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`text-gray-900 font-medium ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}