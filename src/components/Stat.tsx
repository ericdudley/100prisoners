export default function Stat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between py-1 text-md max-w-md">
      <div className="text-gray-700">{label}:</div>
      <div className="font-semibold text-gray-700">{value}</div>
    </div>
  );
}
