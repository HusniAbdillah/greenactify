'use client'

import React, { memo } from 'react'
import { LegendItem } from './types'

interface HeatmapLegendProps {
  legendItems: LegendItem[]
  title?: string
  className?: string
}

const HeatmapLegend = memo(({ legendItems, title = "Data Saturation", className = "" }: HeatmapLegendProps) => {
  return (
    <div className={`bg-white bg-opacity-95 rounded-lg p-3 shadow-lg ${className}`}>
      <div className="text-sm font-semibold mb-2">
        {title}
      </div>
      <div className="space-y-1">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
})

HeatmapLegend.displayName = 'HeatmapLegend'

export default HeatmapLegend
