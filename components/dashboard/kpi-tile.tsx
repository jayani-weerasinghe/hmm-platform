export function KpiTile({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string | number
  subtitle?: string
}) {
  return (
    <div className="flex flex-col rounded-xl bg-white p-5 ring-1 ring-gray-200">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">{title}</h2>
      <div className="text-4xl font-bold tabular-nums text-gray-900">{value}</div>
      {subtitle && (
        <div className="mt-1 text-xs text-gray-500">{subtitle}</div>
      )}
    </div>
  )
}
