export default function TileCard({ title, value, description, bgColor, borderColor, iconColor }: {
  title: string
  value: string
  description: string
  bgColor: string
  borderColor: string
  iconColor: string
}) {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <div className={`${iconColor} bg-white rounded-lg p-2 shadow-sm text-lg`}>●</div>
      </div>
      <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  )
}