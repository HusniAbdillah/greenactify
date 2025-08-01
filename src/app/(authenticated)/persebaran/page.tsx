'use client'

import React, { useState, useEffect, useRef, memo } from 'react'
import { MapPin, Users, TrendingUp, Filter, Calendar, Download, Eye, ZoomIn } from 'lucide-react'

// Memoized Leaflet map component at module scope to prevent remount on parent re-renders
type SimpleMapProps = {
  isClient: boolean
  mapRef: React.RefObject<any>
  provinceCount: number
  totalActivities: number
  formatNumber: (num: number) => string
}
const SimpleLeafletMap = memo(({ isClient, mapRef, provinceCount, totalActivities, formatNumber }: SimpleMapProps) => {
  return (
    <div className="relative w-full h-full">
      {/* Add Leaflet CSS */}
      <style jsx global>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
          border-radius: 8px;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
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
        /* Remove black borders and focus outlines from provinces */
        .leaflet-interactive,
        .province-clickable {
          outline: none !important;
        }
        .leaflet-interactive:focus,
        .province-clickable:focus {
          outline: none !important;
          border: none !important;
        }
        /* Remove default selection styling */
        .leaflet-zoom-animated .leaflet-zoom-hide {
          outline: none !important;
        }
        /* Enhanced tooltip styling */
        .custom-tooltip {
          background: white !important;
          border: none !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          padding: 8px 12px !important;
          font-family: system-ui, -apple-system, sans-serif !important;
        }
        .custom-tooltip::before {
          border-top-color: white !important;
        }
      `}</style>

      {isClient ? (
        <div ref={mapRef} className="w-full h-full rounded-lg" style={{ minHeight: '400px' }} />
      ) : (
        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat peta...</p>
          </div>
        </div>
      )}

      {/* Summary overlay */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-95 rounded-lg p-3 text-sm shadow-lg">
        <div className="font-medium mb-1">Indonesia</div>
        <div className="text-gray-600">{provinceCount} Provinsi</div>
        <div className="text-xs text-gray-500 mt-1">
          Total: {formatNumber(totalActivities)}
        </div>
      </div>
    </div>
  )
})
// Main page component
const PersebaranPage = () => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('month')
  const [isMapFullscreen, setIsMapFullscreen] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [viewMode, setViewMode] = useState<'heatmap' | 'markers'>('heatmap')
  const [isClient, setIsClient] = useState(false)
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    setIsClient(true)
    setLastUpdate(new Date().toLocaleString('id-ID'))
  }, [])

  // Helper function to extract province name from GeoJSON properties
  const extractProvinceName = (properties: any): string | null => {
    if (!properties) return null

    // Try all possible property keys for province names
    const possibleKeys = [
      'PROVINSI', 'NAME_1', 'name', 'Provinsi', 'PROVNO', 'ADMIN',
      'ADM1_EN', 'ADM1_ID', 'NAMA', 'PROVINCE', 'prov', 'province_name',
      'NAME', 'NAMA_PROV', 'PROVINSI_', 'province', 'Province',
      'admin', 'adm1_en', 'adm1_id', 'nama_prov', 'NAME_EN', 'NAME_ID'
    ]

    for (const key of possibleKeys) {
      if (properties[key]) {
        return properties[key]
      }
    }

    // If still no province name, try any property that looks like a name
    for (const [key, value] of Object.entries(properties)) {
      if (typeof value === 'string' && value.length > 2 && value.length < 50) {
        return value
      }
    }

    return null
  }

  // Enhanced color calculation based on data saturation
  const getDataSaturationColor = (activities: number, minValue: number, maxValue: number) => {
    if (!activities || activities === 0) return '#f3f4f6' // Gray for no data

    // Normalize the value between 0 and 1
    const normalized = (activities - minValue) / (maxValue - minValue)

    // Create a gradient from light to dark green based on saturation
    const intensity = Math.pow(normalized, 0.7) // Slight curve for better visual distribution

    if (intensity >= 0.9) return '#064e3b' // Very high - very dark green
    if (intensity >= 0.7) return '#065f46' // High - dark green
    if (intensity >= 0.5) return '#16a34a' // Medium-high - green
    if (intensity >= 0.3) return '#22c55e' // Medium - light green
    if (intensity >= 0.15) return '#4ade80' // Low-medium - lighter green
    return '#86efac' // Very low - very light green
  }

  // Initialize map after client-side rendering - ONLY ONCE
  useEffect(() => {
    if (!isClient || mapInstanceRef.current) return

    const initializeMap = async () => {
      console.log('Initializing map...')
      // Dynamic import to prevent SSR issues
      const L = (await import('leaflet')).default

      // Ensure we have a clean map container
      if (mapRef.current) {
        // Create map centered on Indonesia
        const map = L.map(mapRef.current, {
          center: [-2.5, 118], // Indonesia center
          zoom: 5,
          minZoom: 4,
          maxZoom: 10,
          zoomControl: true,
          attributionControl: false, // Remove attribution
          scrollWheelZoom: true,
          doubleClickZoom: true,
          dragging: true
        })

        // Add simple tile layer without labels
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
          attribution: '',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(map)

        // Load and display GeoJSON data with actual province boundaries
        try {
          // Use more reliable Indonesian provinces GeoJSON sources
          let geoJsonData

          // Try different GeoJSON sources in order of reliability
          const sources = [
            'https://raw.githubusercontent.com/ans-4175/indonesia-geojson/master/provinsi.geojson',
            'https://raw.githubusercontent.com/yusufsyaifudin/indonesia-geojson/master/indonesia-prov.geojson',
            'https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json',
            // Fallback to local data if available
            '/indonesia-provinces.json'
          ]

          for (const source of sources) {
            try {
              const response = await fetch(source)

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
              }

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

          // Create a lookup map for province data with better performance
          const provinceDataMap = new Map(provinceData.map(p => [p.id, p]))

          // Calculate min/max values for better color scaling
          const activityValues = provinceData.map(p => p.totalActivities)
          const minActivities = Math.min(...activityValues)
          const maxActivities = Math.max(...activityValues)
          console.log('Activity range:', minActivities, 'to', maxActivities)

          // Add GeoJSON layer with enhanced styling
          const geoJsonLayer = L.geoJSON(geoJsonData, {
            style: (feature) => {
              const provinceName = extractProvinceName(feature?.properties || {})
              const provinceId = provinceName ? findProvinceIdByName(provinceName) : null
              const province = provinceId ? provinceDataMap.get(provinceId) : null

              if (province) {
                const color = getDataSaturationColor(province.totalActivities, minActivities, maxActivities)
                return {
                  fillColor: color,
                  fillOpacity: 0.8,
                  color: '#ffffff',
                  weight: 1.5,
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

              // Enhanced tooltip with more information
              const tooltipText = province
                ? `<div class="font-semibold">${province.name}</div>
                   <div class="text-sm">Aktivitas: ${province.totalActivities.toLocaleString('id-ID')}</div>
                   <div class="text-sm">Peserta: ${province.participants.toLocaleString('id-ID')}</div>
                   <div class="text-sm">Poin: ${province.totalPoints.toLocaleString('id-ID')}</div>`
                : `<div class="font-semibold">${provinceName || 'Provinsi Tidak Dikenal'}</div>
                   <div class="text-sm text-gray-500">Data tidak tersedia</div>`

              layer.bindTooltip(tooltipText, {
                sticky: true,
                direction: 'top',
                opacity: 0.95,
                className: 'custom-tooltip'
              })

              if (province) {
                // Add click event - just select province, no map movement
                layer.on('click', (e) => {
                  // Stop event propagation to prevent map click
                  L.DomEvent.stopPropagation(e)

                  setSelectedProvince(currentSelected =>
                    currentSelected === province.id ? null : province.id
                  )
                })

                // Enhanced hover effect with smooth transitions
                const originalColor = getDataSaturationColor(province.totalActivities, minActivities, maxActivities)
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
                    weight: 1.5,
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


        } catch (error) {
          console.error('Error loading GeoJSON data:', error)
        }

        mapInstanceRef.current = map
      }
    }

    initializeMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isClient]) // ONLY isClient dependency to prevent map recreation

  // Helper function to match province names from GeoJSON to our data
  const findProvinceIdByName = (provinceName: string): string | null => {
    if (!provinceName) return null

    const nameMapping: { [key: string]: string } = {
      // Indonesian names (common in GeoJSON)
      'DKI JAKARTA': 'DKI_JAKARTA',
      'JAKARTA': 'DKI_JAKARTA',
      'DKI_JAKARTA': 'DKI_JAKARTA',
      'JAKARTA RAYA': 'DKI_JAKARTA',
      'D.K.I. JAKARTA': 'DKI_JAKARTA',
      'SPECIAL CAPITAL REGION OF JAKARTA': 'DKI_JAKARTA',

      'JAWA BARAT': 'JAWA_BARAT',
      'WEST JAVA': 'JAWA_BARAT',
      'JAWA_BARAT': 'JAWA_BARAT',
      'JABAR': 'JAWA_BARAT',

      'JAWA TENGAH': 'JAWA_TENGAH',
      'CENTRAL JAVA': 'JAWA_TENGAH',
      'JAWA_TENGAH': 'JAWA_TENGAH',
      'JATENG': 'JAWA_TENGAH',

      'JAWA TIMUR': 'JAWA_TIMUR',
      'EAST JAVA': 'JAWA_TIMUR',
      'JAWA_TIMUR': 'JAWA_TIMUR',
      'JATIM': 'JAWA_TIMUR',

      'SUMATERA UTARA': 'SUMATERA_UTARA',
      'NORTH SUMATRA': 'SUMATERA_UTARA',
      'SUMATERA_UTARA': 'SUMATERA_UTARA',
      'SUMATRA UTARA': 'SUMATERA_UTARA',
      'SUMUT': 'SUMATERA_UTARA',
      'SUMATERA UTARA PROVINCE': 'SUMATERA_UTARA',

      'SUMATERA BARAT': 'SUMATERA_BARAT',
      'WEST SUMATRA': 'SUMATERA_BARAT',
      'SUMATERA_BARAT': 'SUMATERA_BARAT',
      'SUMATRA BARAT': 'SUMATERA_BARAT',
      'SUMBAR': 'SUMATERA_BARAT',

      'SUMATERA SELATAN': 'SUMATERA_SELATAN',
      'SOUTH SUMATRA': 'SUMATERA_SELATAN',
      'SUMATERA_SELATAN': 'SUMATERA_SELATAN',
      'SUMATRA SELATAN': 'SUMATERA_SELATAN',
      'SUMSEL': 'SUMATERA_SELATAN',

      'RIAU': 'RIAU',
      'RIAU PROVINCE': 'RIAU',

      'KALIMANTAN TIMUR': 'KALIMANTAN_TIMUR',
      'EAST KALIMANTAN': 'KALIMANTAN_TIMUR',
      'KALIMANTAN_TIMUR': 'KALIMANTAN_TIMUR',
      'KALTIM': 'KALIMANTAN_TIMUR',

      'KALIMANTAN SELATAN': 'KALIMANTAN_SELATAN',
      'SOUTH KALIMANTAN': 'KALIMANTAN_SELATAN',
      'KALIMANTAN_SELATAN': 'KALIMANTAN_SELATAN',
      'KALSEL': 'KALIMANTAN_SELATAN',

      'SULAWESI SELATAN': 'SULAWESI_SELATAN',
      'SOUTH SULAWESI': 'SULAWESI_SELATAN',
      'SULAWESI_SELATAN': 'SULAWESI_SELATAN',
      'SULSEL': 'SULAWESI_SELATAN',

      'BALI': 'BALI',
      'BALI PROVINCE': 'BALI',

      'PAPUA': 'PAPUA',
      'IRIAN JAYA': 'PAPUA',
      'PAPUA PROVINCE': 'PAPUA',

      'NUSA TENGGARA BARAT': 'NUSA_TENGGARA_BARAT',
      'WEST NUSA TENGGARA': 'NUSA_TENGGARA_BARAT',
      'NUSA_TENGGARA_BARAT': 'NUSA_TENGGARA_BARAT',
      'NTB': 'NUSA_TENGGARA_BARAT',

      'LAMPUNG': 'LAMPUNG',
      'LAMPUNG PROVINCE': 'LAMPUNG',

      // Add more province mappings
      'YOGYAKARTA': 'DI_YOGYAKARTA',
      'DI YOGYAKARTA': 'DI_YOGYAKARTA',
      'SPECIAL REGION OF YOGYAKARTA': 'DI_YOGYAKARTA',
      'DAERAH ISTIMEWA YOGYAKARTA': 'DI_YOGYAKARTA',

      'BANTEN': 'BANTEN',
      'BANTEN PROVINCE': 'BANTEN',

      'ACEH': 'ACEH',
      'NANGGROE ACEH DARUSSALAM': 'ACEH',
      'ACEH PROVINCE': 'ACEH'
    }

    // Try exact match first
    const upperName = provinceName.toUpperCase().trim()

    if (nameMapping[upperName]) {
      return nameMapping[upperName]
    }

    // Try partial match
    for (const [key, value] of Object.entries(nameMapping)) {
      if (upperName.includes(key) || key.includes(upperName)) {
        return value
      }
    }

    // Try to match by removing common suffixes/prefixes
    const cleanName = upperName
      .replace(/\bPROVINCE\b/g, '')
      .replace(/\bPROVINSI\b/g, '')
      .replace(/\bDAERAH\b/g, '')
      .replace(/\bISTIMEWA\b/g, '')
      .replace(/\bKHUSUS\b/g, '')
      .trim()

    if (cleanName !== upperName && nameMapping[cleanName]) {
      return nameMapping[cleanName]
    }

    return null
  }

  // Function to get approximate province boundaries
  // In a real application, you would use actual GeoJSON data
  const getProvinceBounds = (provinceId: string): [number, number][] | null => {
    const bounds: { [key: string]: [number, number][] } = {
      'DKI_JAKARTA': [
        [-6.35, 106.6], [-6.35, 107.0], [-5.9, 107.0], [-5.9, 106.6]
      ],
      'JAWA_BARAT': [
        [-7.5, 106.0], [-7.5, 108.5], [-5.8, 108.5], [-5.8, 106.0]
      ],
      'JAWA_TIMUR': [
        [-8.8, 111.0], [-8.8, 114.5], [-6.8, 114.5], [-6.8, 111.0]
      ],
      'JAWA_TENGAH': [
        [-8.5, 108.5], [-8.5, 111.5], [-6.5, 111.5], [-6.5, 108.5]
      ],
      'SUMATERA_UTARA': [
        [1.0, 97.0], [1.0, 100.0], [4.5, 100.0], [4.5, 97.0]
      ],
      'SUMATERA_BARAT': [
        [-2.5, 99.0], [-2.5, 102.0], [0.5, 102.0], [0.5, 99.0]
      ],
      'RIAU': [
        [-1.5, 100.0], [-1.5, 104.0], [2.5, 104.0], [2.5, 100.0]
      ],
      'KALIMANTAN_TIMUR': [
        [-2.0, 113.5], [-2.0, 119.0], [4.0, 119.0], [4.0, 113.5]
      ],
      'SULAWESI_SELATAN': [
        [-8.0, 118.0], [-8.0, 122.0], [-1.0, 122.0], [-1.0, 118.0]
      ],
      'BALI': [
        [-8.8, 114.4], [-8.8, 115.7], [-8.0, 115.7], [-8.0, 114.4]
      ],
      'SUMATERA_SELATAN': [
        [-5.0, 102.0], [-5.0, 106.0], [-1.0, 106.0], [-1.0, 102.0]
      ],
      'KALIMANTAN_SELATAN': [
        [-4.5, 114.0], [-4.5, 116.5], [-1.5, 116.5], [-1.5, 114.0]
      ],
      'PAPUA': [
        [-9.0, 130.0], [-9.0, 141.0], [1.0, 141.0], [1.0, 130.0]
      ],
      'NUSA_TENGGARA_BARAT': [
        [-9.5, 115.5], [-9.5, 119.0], [-7.5, 119.0], [-7.5, 115.5]
      ],
      'LAMPUNG': [
        [-6.5, 103.5], [-6.5, 106.0], [-3.5, 106.0], [-3.5, 103.5]
      ]
    }

    return bounds[provinceId] || null
  }

  const provinceData = [
    {
      id: 'DKI_JAKARTA',
      name: 'DKI Jakarta',
      code: 'JK',
      totalPoints: 45420,
      totalActivities: 8420,
      participants: 1250,
      averagePerUser: 36.3,
      topActivity: 'Transportasi Umum',
      coordinates: [106.8456, -6.2088], // [lng, lat] for SVG positioning
      growth: '+12%',
      position: { x: 52, y: 62 } // SVG coordinates (percentage)
    },
    {
      id: 'JAWA_BARAT',
      name: 'Jawa Barat',
      code: 'JB',
      totalPoints: 42350,
      totalActivities: 7200,
      participants: 2100,
      averagePerUser: 20.2,
      topActivity: 'Tanam Pohon',
      coordinates: [107.6191, -6.9175],
      growth: '+8%',
      position: { x: 54, y: 65 }
    },
    {
      id: 'JAWA_TIMUR',
      name: 'Jawa Timur',
      code: 'JT',
      totalPoints: 38200,
      totalActivities: 6800,
      participants: 1800,
      averagePerUser: 21.2,
      topActivity: 'Daur Ulang',
      coordinates: [112.7521, -7.2575],
      growth: '+15%',
      position: { x: 62, y: 67 }
    },
    {
      id: 'JAWA_TENGAH',
      name: 'Jawa Tengah',
      code: 'JTG',
      totalPoints: 32100,
      totalActivities: 5900,
      participants: 1650,
      averagePerUser: 19.5,
      topActivity: 'Bersih-bersih',
      coordinates: [110.1403, -7.1500],
      growth: '+5%',
      position: { x: 58, y: 66 }
    },
    {
      id: 'SUMATERA_UTARA',
      name: 'Sumatera Utara',
      code: 'SU',
      totalPoints: 28500,
      totalActivities: 5400,
      participants: 1200,
      averagePerUser: 23.8,
      topActivity: 'Konservasi Hutan',
      coordinates: [98.6722, 3.5952],
      growth: '+18%',
      position: { x: 25, y: 25 }
    },
    {
      id: 'SUMATERA_BARAT',
      name: 'Sumatera Barat',
      code: 'SB',
      totalPoints: 22300,
      totalActivities: 4850,
      participants: 950,
      averagePerUser: 23.5,
      topActivity: 'Tanam Pohon',
      coordinates: [100.6531, -0.7893],
      growth: '+10%',
      position: { x: 22, y: 45 }
    },
    {
      id: 'RIAU',
      name: 'Riau',
      code: 'RI',
      totalPoints: 19800,
      totalActivities: 4650,
      participants: 780,
      averagePerUser: 25.4,
      topActivity: 'Reboisasi',
      coordinates: [101.7068, 0.2933],
      growth: '+22%',
      position: { x: 28, y: 42 }
    },
    {
      id: 'KALIMANTAN_TIMUR',
      name: 'Kalimantan Timur',
      code: 'KAL',
      totalPoints: 25600,
      totalActivities: 5100,
      participants: 1100,
      averagePerUser: 23.3,
      topActivity: 'Konservasi',
      coordinates: [116.8392, 1.6753],
      growth: '+14%',
      position: { x: 75, y: 40 }
    },
    {
      id: 'SULAWESI_SELATAN',
      name: 'Sulawesi Selatan',
      code: 'SUL',
      totalPoints: 21400,
      totalActivities: 4750,
      participants: 850,
      averagePerUser: 25.2,
      topActivity: 'Bersih Pantai',
      coordinates: [119.9740, -3.6687],
      growth: '+16%',
      position: { x: 78, y: 55 }
    },
    {
      id: 'BALI',
      name: 'Bali',
      code: 'BALI',
      totalPoints: 31200,
      totalActivities: 5650,
      participants: 1350,
      averagePerUser: 23.1,
      topActivity: 'Eco Tourism',
      coordinates: [115.1889, -8.4095],
      growth: '+20%',
      position: { x: 65, y: 70 }
    },
    {
      id: 'SUMATERA_SELATAN',
      name: 'Sumatera Selatan',
      code: 'SS',
      totalPoints: 18900,
      totalActivities: 4200,
      participants: 720,
      averagePerUser: 26.2,
      topActivity: 'Konservasi Lahan',
      coordinates: [103.9140, -3.3194],
      growth: '+11%',
      position: { x: 25, y: 52 }
    },
    {
      id: 'KALIMANTAN_SELATAN',
      name: 'Kalimantan Selatan',
      code: 'KS',
      totalPoints: 17500,
      totalActivities: 3800,
      participants: 680,
      averagePerUser: 25.7,
      topActivity: 'Penghijauan',
      coordinates: [115.2838, -3.0926],
      growth: '+9%',
      position: { x: 70, y: 52 }
    },
    {
      id: 'PAPUA',
      name: 'Papua',
      code: 'PP',
      totalPoints: 15200,
      totalActivities: 3200,
      participants: 580,
      averagePerUser: 26.2,
      topActivity: 'Konservasi Hutan',
      coordinates: [138.0804, -4.2699],
      growth: '+25%',
      position: { x: 85, y: 50 }
    },
    {
      id: 'NUSA_TENGGARA_BARAT',
      name: 'Nusa Tenggara Barat',
      code: 'NTB',
      totalPoints: 14800,
      totalActivities: 3100,
      participants: 520,
      averagePerUser: 28.5,
      topActivity: 'Konservasi Air',
      coordinates: [117.3616, -8.6529],
      growth: '+13%',
      position: { x: 68, y: 72 }
    },
    {
      id: 'LAMPUNG',
      name: 'Lampung',
      code: 'LA',
      totalPoints: 16700,
      totalActivities: 3500,
      participants: 650,
      averagePerUser: 25.7,
      topActivity: 'Pertanian Organik',
      coordinates: [105.4068, -4.5585],
      growth: '+7%',
      position: { x: 28, y: 58 }
    }
  ]

  const getMarkerSize = (activities: number) => {
    if (activities > 7000) return 15
    if (activities > 5500) return 12
    if (activities > 4000) return 10
    if (activities > 2500) return 8
    return 6
  }

  // Legacy color function for fallback
  const getHeatmapColor = (activities: number) => {
    if (activities > 7000) return '#065f46' // Very high - dark green
    if (activities > 5500) return '#16a34a' // High - green
    if (activities > 4000) return '#22c55e' // Medium - light green
    if (activities > 2500) return '#86efac' // Low - very light green
    return '#dcfce7' // Very low - pale green
  }

  // ...existing code...

  const activityTypes = [
    { name: 'Tanam Pohon', count: 2850, color: '#16a34a', percentage: 28 },
    { name: 'Daur Ulang', count: 2100, color: '#2563eb', percentage: 21 },
    { name: 'Transportasi Hijau', count: 1950, color: '#9333ea', percentage: 19 },
    { name: 'Konservasi', count: 1650, color: '#ea580c', percentage: 16 },
    { name: 'Bersih-bersih', count: 1450, color: '#dc2626', percentage: 14 },
  ]

  // Consistent number formatting function
  const formatNumber = (num: number) => {
    if (!isClient) return num.toString() // Return plain number during SSR
    return num.toLocaleString('id-ID') // Use Indonesian locale on client
  }

  const handleDownloadData = () => {
    const dataStr = JSON.stringify({
      timestamp: new Date().toISOString(),
      timeFilter,
      provinces: provinceData,
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
    link.download = `heatmap-data-${timeFilter}-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  const selectedProvinceData = provinceData.find(p => p.id === selectedProvince)

  return (
    <div className="p-6 space-y-6">
      {/* Add Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Peta Persebaran Aktivitas</h1>
        <p>Visualisasi real-time aktivitas hijau di seluruh Indonesia dengan data saturation heatmap</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="week">7 Hari Terakhir</option>
              <option value="month">30 Hari Terakhir</option>
              <option value="year">Tahun Ini</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('heatmap')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'heatmap'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Heatmap
              </button>
              <button
                onClick={() => setViewMode('markers')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'markers'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Markers
              </button>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Update terakhir: {isClient ? lastUpdate : 'Memuat...'}</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setIsMapFullscreen(!isMapFullscreen)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isMapFullscreen ? <Eye className="w-5 h-5 mr-2" /> : <ZoomIn className="w-5 h-5 mr-2" />}
              {isMapFullscreen ? 'Normal View' : 'Fullscreen'}
            </button>
            <button
              onClick={handleDownloadData}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-5 h-5 mr-2" />
              Unduh Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`grid gap-6 ${isMapFullscreen ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
        {/* Enhanced Map */}
        <div className={`${isMapFullscreen ? 'col-span-1' : 'lg:col-span-2'}`}>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {viewMode === 'heatmap' ? 'Data Saturation Heatmap Indonesia' : 'Peta Aktivitas Indonesia'}
              </h2>
              <div className="text-sm text-gray-600">
                Klik provinsi untuk melihat detail
              </div>
            </div>

            <div className={`relative rounded-lg overflow-hidden ${isMapFullscreen ? 'h-[80vh]' : 'h-96'}`}>
              <SimpleLeafletMap
                isClient={isClient}
                mapRef={mapRef}
                provinceCount={provinceData.length}
                totalActivities={provinceData.reduce((sum, p) => sum + p.totalActivities, 0)}
                formatNumber={formatNumber}
              />

              {/* Enhanced Legend */}
              <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg">
                <div className="text-sm font-semibold mb-2">
                  Data Saturation - Aktivitas per Provinsi
                </div>
                <div className="space-y-1">
                  {[
                    { color: '#064e3b', label: 'Sangat Tinggi (>90th percentile)' },
                    { color: '#065f46', label: 'Tinggi (70-90th percentile)' },
                    { color: '#16a34a', label: 'Sedang-Tinggi (50-70th percentile)' },
                    { color: '#22c55e', label: 'Sedang (30-50th percentile)' },
                    { color: '#4ade80', label: 'Rendah-Sedang (15-30th percentile)' },
                    { color: '#86efac', label: 'Rendah (<15th percentile)' },
                    { color: '#f3f4f6', label: 'Tidak ada data' }
                  ].map((item, index) => (
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
            </div>
          </div>
        </div>

        {/* Province Details & Statistics */}
        {!isMapFullscreen && (
          <div className="space-y-4">
            {/* Selected Province Details */}
            {selectedProvinceData ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  {selectedProvinceData.name}
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {formatNumber(selectedProvinceData.totalPoints)}
                      </div>
                      <div className="text-sm text-gray-600">Total Poin</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatNumber(selectedProvinceData.participants)}
                      </div>
                      <div className="text-sm text-gray-600">Peserta</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatNumber(selectedProvinceData.totalActivities)}
                      </div>
                      <div className="text-sm text-gray-600">Aktivitas</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedProvinceData.averagePerUser}
                      </div>
                      <div className="text-sm text-gray-600">Avg/User</div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600">Aktivitas Terpopuler</div>
                    <div className="font-semibold">{selectedProvinceData.topActivity}</div>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded">
                    <div className="text-sm text-gray-600">Pertumbuhan {timeFilter === 'week' ? 'Minggu' : timeFilter === 'month' ? 'Bulan' : 'Tahun'} Ini</div>
                    <div className="font-bold text-green-600 text-lg">{selectedProvinceData.growth}</div>
                  </div>
                </div>
              </div>
              ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4">Pilih Provinsi</h3>
                <p className="text-gray-600 text-center">
                  Klik pada provinsi di peta untuk melihat detail aktivitas
                </p>
                <div className="mt-4 text-center">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto" />
                </div>
              </div>
            )}

            {/* Top Activities */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Aktivitas Terpopuler</h3>
              <div className="space-y-3">
                {activityTypes.map((activity, index) => (
                  <div key={activity.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: activity.color }}
                      ></div>
                      <span className="font-medium">{activity.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">{formatNumber(activity.count)}</div>
                      <div className="text-xs text-gray-500">{activity.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Statistik Cepat</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Provinsi Teraktif</span>
                  <span className="font-bold">DKI Jakarta</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total CO₂ Diselamatkan</span>
                  <span className="font-bold text-green-600">1,250 kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pertumbuhan Rata-rata</span>
                  <span className="font-bold text-blue-600">+13.8%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6">Ringkasan Nasional</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatNumber(provinceData.reduce((sum, p) => sum + p.totalActivities, 0))}
            </div>
            <div className="text-gray-600">Total Aktivitas</div>
            <div className="text-sm text-green-500 font-medium">+12% minggu ini</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatNumber(provinceData.reduce((sum, p) => sum + p.participants, 0))}
            </div>
            <div className="text-gray-600">Total Peserta</div>
            <div className="text-sm text-blue-500 font-medium">+8% minggu ini</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatNumber(provinceData.reduce((sum, p) => sum + p.totalPoints, 0))}
            </div>
            <div className="text-gray-600">Total Poin</div>
            <div className="text-sm text-purple-500 font-medium">+15% minggu ini</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {provinceData.length}
            </div>
            <div className="text-gray-600">Region Aktif</div>
            <div className="text-sm text-yellow-500 font-medium">100% coverage</div>
          </div>
        </div>
      </div>

      {/* Mobile bottom padding */}
      <div className="md:hidden h-20"></div>
    </div>
  )
}

export default PersebaranPage
