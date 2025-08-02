'use client'

import React, { useState, useEffect } from 'react'
import { Eye, ZoomIn, Download } from 'lucide-react'
import LeafletMap from './LeafletMap'
import { ProvinceData, HeatmapConfig, MapControlsConfig } from './types'

interface HeatmapWidgetProps {
  provinceData: ProvinceData[]
  config?: Partial<HeatmapConfig>
  mapControls?: MapControlsConfig
  onProvinceClick?: (province: ProvinceData | null) => void
  selectedProvince?: string | null
  enableFullscreen?: boolean
  enableDownload?: boolean
  title?: string
  description?: string
  className?: string
}

const HeatmapWidget: React.FC<HeatmapWidgetProps> = ({
  provinceData,
  config = {},
  mapControls = {},
  onProvinceClick,
  selectedProvince,
  enableFullscreen = true,
  enableDownload = false,
  title = "Peta Persebaran Data",
  description = "Visualisasi data provinsi Indonesia",
  className = ""
}) => {
  const [isClient, setIsClient] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Default configuration
  const defaultConfig: HeatmapConfig = {
    center: [-2.5, 118],
    zoom: 5,
    minZoom: 4,
    maxZoom: 10,
    showLegend: true,
    showSummary: true,
    height: '400px',
    colorScheme: 'green',
    dataField: 'totalActivities',
    ...config
  }

  // Adjust height for fullscreen
  const finalConfig = {
    ...defaultConfig,
    height: isFullscreen ? '80vh' : defaultConfig.height
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleDownload = () => {
    const dataStr = JSON.stringify({
      timestamp: new Date().toISOString(),
      data: provinceData,
      summary: {
        totalProvinces: provinceData.length,
        totalActivities: provinceData.reduce((sum, p) => sum + p.totalActivities, 0),
        totalParticipants: provinceData.reduce((sum, p) => sum + p.participants, 0),
        totalPoints: provinceData.reduce((sum, p) => sum + p.totalPoints, 0)
      }
    }, null, 2)

    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `heatmap-data-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (provinceData.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data provinsi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-0 ${className}`}>
      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden">
        {/* Add Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />

        <LeafletMap
          provinceData={provinceData}
          config={finalConfig}
          mapControls={mapControls}
          onProvinceClick={onProvinceClick}
          selectedProvince={selectedProvince}
          isClient={isClient}
        />
      </div>
    </div>
  )
}

export default HeatmapWidget
