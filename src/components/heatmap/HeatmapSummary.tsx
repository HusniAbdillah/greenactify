'use client'

import React, { memo } from 'react'
import { ProvinceData } from './types'
import { formatNumber } from './utils'

interface HeatmapSummaryProps {
  provinceData: ProvinceData[]
  isClient: boolean
  className?: string
  title?: string
}

const HeatmapSummary = memo(({
  provinceData,
  isClient,
  className = "",
  title = "Indonesia"
}: HeatmapSummaryProps) => {
  const provinceCount = provinceData.length
  const totalActivities = provinceData.reduce((sum, p) => sum + p.totalActivities, 0)

  return (
    <div className={`bg-white bg-opacity-95 rounded-lg p-3 text-sm shadow-lg ${className}`}>
      <div className="font-medium mb-1">{title}</div>
      <div className="text-gray-600">{provinceCount} Provinsi</div>
      <div className="text-xs text-gray-500 mt-1">
        Total: {formatNumber(totalActivities, isClient)}
      </div>
    </div>
  )
})

HeatmapSummary.displayName = 'HeatmapSummary'

export default HeatmapSummary
