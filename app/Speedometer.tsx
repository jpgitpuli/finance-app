import React from 'react'
import { PieChart, Pie, Cell } from 'recharts'

interface SpeedometerProps {
  value: number // Value in millions (e.g., 12.5 for 12.5M)
  maxValue?: number // Maximum value (default 20M)
}

const Speedometer: React.FC<SpeedometerProps> = ({ value, maxValue = 20 }) => {
  const chartWidth = 192
  const chartHeight = 128
  const centerX = chartWidth / 2
  const centerY = chartHeight * 0.8

  // Clamp to a valid range for gauge math
  const normalized = Math.max(0, Math.min(value / maxValue, 1))
  const percentage = normalized * 100

  // Create data for the gauge background
  const backgroundData = [
    { name: 'Background', value: 100, color: '#e5e7eb' }
  ]

  // Create data for the value indicator
  const valueData = [
    { name: 'Value', value: percentage, color: '#3b82f6' },
    { name: 'Remaining', value: 100 - percentage, color: 'transparent' }
  ]

  // Map value onto upper semicircle: 0 -> left, 0.5 -> top, 1 -> right
  const needleAngle = Math.PI - normalized * Math.PI
  const needleLength = 60
  const needleX = centerX + needleLength * Math.cos(needleAngle)
  const needleY = centerY - needleLength * Math.sin(needleAngle)

  return (
    <div className="relative w-48 h-32">
      <PieChart width={chartWidth} height={chartHeight}>
        <Pie
          data={backgroundData}
          cx={centerX}
          cy={centerY}
          startAngle={180}
          endAngle={0}
          innerRadius={50}
          outerRadius={70}
          dataKey="value"
          isAnimationActive={false}
        >
          {backgroundData.map((entry, index) => (
            <Cell key={`background-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Pie
          data={valueData}
          cx={centerX}
          cy={centerY}
          startAngle={180}
          endAngle={0}
          innerRadius={50}
          outerRadius={70}
          dataKey="value"
          isAnimationActive
        >
          {valueData.map((entry, index) => (
            <Cell key={`value-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>

      {/* Needle */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        <line
          x1={centerX}
          y1={centerY}
          x2={needleX}
          y2={needleY}
          stroke="#ef4444"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r="5"
          fill="#ef4444"
        />
      </svg>

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600 px-2">
        <span>0M</span>
        <span>5M</span>
        <span>10M</span>
        <span>15M</span>
        <span>20M</span>
      </div>

      {/* Value display */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-lg font-bold text-gray-800">
        {value.toFixed(1)}M
      </div>
    </div>
  )
}

export default Speedometer