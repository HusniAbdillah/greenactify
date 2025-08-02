'use client'

import React, { memo, useRef, useEffect } from 'react'
import { ProvinceData, HeatmapConfig, MapControlsConfig } from './types'
import {
  getDataSaturationColor,
  extractProvinceName,
  findProvinceIdByName,
  formatNumber
} from './utils'
import HeatmapLegend from './HeatmapLegend'
import HeatmapSummary from './HeatmapSummary'
import { generateLegendItems } from './utils'

interface LeafletMapProps {
  provinceData: ProvinceData[]
  config: HeatmapConfig
  mapControls?: MapControlsConfig
  onProvinceClick?: (province: ProvinceData | null) => void
  selectedProvince?: string | null
  isClient: boolean
  className?: string
}

const LeafletMap = memo(({
  provinceData,
  config,
  mapControls = {},
  onProvinceClick,
  selectedProvince,
  isClient,
  className = ""
}: LeafletMapProps) => {
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const geoJsonLayerRef = useRef<any>(null)

  const {
    center = [-2.5, 118],
    zoom = 5,
    minZoom = 4,
    maxZoom = 10,
    showLegend = true,
    showSummary = true,
    height = '400px',
    colorScheme = 'green',
    dataField = 'totalActivities'
  } = config

  const {
    showZoom = true,
    showAttribution = false,
    showScale = false
  } = mapControls

  // Calculate min/max values for color scaling
  const dataValues = provinceData.map(p => p[dataField] as number)
  const minValue = Math.min(...dataValues)
  const maxValue = Math.max(...dataValues)

  // Generate legend items
  const legendItems = generateLegendItems(minValue, maxValue, colorScheme)

  // Initialize map
  useEffect(() => {
    if (!isClient || mapInstanceRef.current || provinceData.length === 0) return

    const initializeMap = async () => {
      try {
        // Dynamic import to prevent SSR issues
        const L = (await import('leaflet')).default

        if (mapRef.current) {
          // Create map
          const map = L.map(mapRef.current, {
            center,
            zoom,
            minZoom,
            maxZoom,
            zoomControl: showZoom,
            attributionControl: showAttribution,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            dragging: true,
            // Prevent automatic centering behaviors
            trackResize: false,
            boxZoom: false,
            keyboard: false
          })

          // Add tile layer
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: showAttribution ? '' : '',
            subdomains: 'abcd',
            maxZoom: 20
          }).addTo(map)

          // Add scale control if requested
          if (showScale) {
            L.control.scale().addTo(map)
          }

          // Load GeoJSON data
          const sources = [
            'https://raw.githubusercontent.com/ans-4175/indonesia-geojson/master/provinsi.geojson',
            'https://raw.githubusercontent.com/yusufsyaifudin/indonesia-geojson/master/indonesia-prov.geojson',
            'https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json'
          ]

          let geoJsonData
          for (const source of sources) {
            try {
              const response = await fetch(source)
              if (!response.ok) continue

              const contentType = response.headers.get("content-type")
              if (!contentType || (!contentType.includes("application/json") && !contentType.includes("text/plain"))) {
                continue
              }

              const text = await response.text()
              geoJsonData = JSON.parse(text)
              console.log('Successfully loaded GeoJSON from:', source)
              break
            } catch (error) {
              console.warn('Failed to load GeoJSON from:', source, error)
              continue
            }
          }

          if (!geoJsonData) {
            throw new Error('All GeoJSON sources failed')
          }

          // Create lookup map for province data
          const provinceDataMap = new Map(provinceData.map(p => [p.id, p]))

          // Add GeoJSON layer
          const geoJsonLayer = L.geoJSON(geoJsonData, {
            style: (feature) => {
              const provinceName = extractProvinceName(feature?.properties || {})
              const provinceId = provinceName ? findProvinceIdByName(provinceName) : null
              const province = provinceId ? provinceDataMap.get(provinceId) : null

              if (province) {
                const value = province[dataField] as number
                const color = getDataSaturationColor(value, minValue, maxValue, colorScheme)
                return {
                  fillColor: color,
                  fillOpacity: 0.8,
                  color: '#ffffff',
                  weight: selectedProvince === province.id ? 3 : 1.5,
                  opacity: 1,
                  interactive: true,
                  className: 'province-clickable'
                }
              } else {
                return {
                  fillColor: '#f3f4f6',
                  fillOpacity: 0.4,
                  color: '#d1d5db',
                  weight: 1,
                  opacity: 0.7,
                  interactive: false
                }
              }
            },
            onEachFeature: (feature, layer) => {
              const provinceName = extractProvinceName(feature?.properties || {})
              const provinceId = provinceName ? findProvinceIdByName(provinceName) : null
              const province = provinceId ? provinceDataMap.get(provinceId) : null

              // Enhanced tooltip
              const tooltipText = province
                ? `<div class="font-semibold">${province.name}</div>
                   <div class="text-sm">Aktivitas: ${formatNumber(province.totalActivities, isClient)}</div>
                   <div class="text-sm">Peserta: ${formatNumber(province.participants, isClient)}</div>
                   <div class="text-sm">Poin: ${formatNumber(province.totalPoints, isClient)}</div>`
                : `<div class="font-semibold">${provinceName || 'Provinsi Tidak Dikenal'}</div>
                   <div class="text-sm text-gray-500">Data tidak tersedia</div>`

              layer.bindTooltip(tooltipText, {
                sticky: true,
                direction: 'top',
                opacity: 0.95,
                className: 'custom-tooltip'
              })

              if (province) {
                // Click handler
                layer.on('click', (e) => {
                  // Prevent map from panning/centering
                  L.DomEvent.stopPropagation(e)

                  if (onProvinceClick) {
                    const newSelected = selectedProvince === province.id ? null : province
                    onProvinceClick(newSelected)
                  }
                })

                // Hover effects
                const originalColor = getDataSaturationColor(
                  province[dataField] as number,
                  minValue,
                  maxValue,
                  colorScheme
                )

                layer.on('mouseover', () => {
                  (layer as any).setStyle({
                    weight: 3,
                    fillOpacity: 0.9,
                    color: '#1f2937',
                    fillColor: originalColor
                  })
                })

                layer.on('mouseout', () => {
                  (layer as any).setStyle({
                    weight: selectedProvince === province.id ? 3 : 1.5,
                    fillOpacity: 0.8,
                    color: '#ffffff',
                    fillColor: originalColor
                  })
                })
              } else {
                // Style for unmatched provinces
                layer.on('mouseover', () => {
                  (layer as any).setStyle({
                    weight: 2,
                    fillOpacity: 0.6,
                    color: '#6b7280',
                    fillColor: '#e5e7eb'
                  })
                })

                layer.on('mouseout', () => {
                  (layer as any).setStyle({
                    weight: 1,
                    fillOpacity: 0.4,
                    color: '#d1d5db',
                    fillColor: '#f3f4f6'
                  })
                })
              }
            }
          })

          geoJsonLayer.addTo(map)
          mapInstanceRef.current = map
        }
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    initializeMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isClient, provinceData, dataField, colorScheme, minValue, maxValue])

  // Separate effect to update styles when selectedProvince changes
  useEffect(() => {
    if (!isClient || !geoJsonLayerRef.current) return

    geoJsonLayerRef.current.eachLayer((layer: any) => {
      const province = layer.feature.properties
      const isSelected = selectedProvince === province.id

      layer.setStyle({
        weight: isSelected ? 3 : 1.5,
        color: isSelected ? '#000' : '#666',
        dashArray: isSelected ? '5, 5' : ''
      })
    })
  }, [selectedProvince, isClient])

  return (
    <div className={`relative w-full ${className}`} style={{ height }}>
      {/* Leaflet CSS */}
      <style jsx global>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          z-index: 1 !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
          z-index: 2 !important;
        }
        .leaflet-control-zoom a {
          background-color: white !important;
          border: none !important;
          border-radius: 4px !important;
          margin: 2px !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #f3f4f6 !important;
        }
        .leaflet-interactive,
        .province-clickable {
          outline: none !important;
        }
        .leaflet-interactive:focus,
        .province-clickable:focus {
          outline: none !important;
          border: none !important;
        }
        .leaflet-zoom-animated .leaflet-zoom-hide {
          outline: none !important;
        }
        .custom-tooltip {
          background: white !important;
          border: none !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          padding: 8px 12px !important;
          font-family: system-ui, -apple-system, sans-serif !important;
          z-index: 1000 !important;
        }
        .custom-tooltip::before {
          border-top-color: white !important;
        }
        .leaflet-map-pane {
          z-index: 1 !important;
        }
        .leaflet-tile-pane {
          z-index: 1 !important;
        }
      `}</style>

      {isClient ? (
        <div ref={mapRef} className="w-full h-full rounded-lg" />
      ) : (
        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat peta...</p>
          </div>
        </div>
      )}

      {/* Summary overlay */}
      {showSummary && (
        <HeatmapSummary
          provinceData={provinceData}
          isClient={isClient}
          className="absolute top-4 right-4"
        />
      )}

      {/* Legend */}
      {showLegend && (
        <HeatmapLegend
          legendItems={legendItems}
          title={`${dataField === 'totalActivities' ? 'Aktivitas' : 'Data'} per Provinsi`}
          className="absolute bottom-4 left-4"
        />
      )}
    </div>
  )
})

LeafletMap.displayName = 'LeafletMap'

export default LeafletMap
