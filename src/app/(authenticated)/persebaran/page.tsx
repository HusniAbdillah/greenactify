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
          z-index: 1000 !important;
        }
        .custom-tooltip::before {
          border-top-color: white !important;
        }
        /* Ensure map container has lower z-index than navbar */
        .leaflet-map-pane {
          z-index: 1 !important;
        }
        .leaflet-tile-pane {
          z-index: 1 !important;
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
  const [isClient, setIsClient] = useState(false)
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)

  // Statistics state
  const [statisticsData, setStatisticsData] = useState({
    totalActivities: 0,
    totalParticipants: 0,
    totalPoints: 0,
    activeRegions: 0,
    loading: true
  })

  // Popular activities state
  const [popularActivitiesData, setPopularActivitiesData] = useState({
    activities: [] as Array<{ name: string; count: number; percentage: number; color: string }>,
    loading: true
  })

  // Province data state
  const [provinceData, setProvinceData] = useState<Array<{
    id: string
    name: string
    code: string
    totalPoints: number
    totalActivities: number
    participants: number
    averagePerUser: number
    topActivity: string
    coordinates: [number, number]
    growth: string
    position: { x: number; y: number }
    rank?: number
  }>>([])

  const [provinceDataLoading, setProvinceDataLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
    setLastUpdate(new Date().toLocaleString('id-ID'))
    fetchStatisticsData()
    fetchPopularActivitiesData()
    fetchProvinceData()
  }, [])

  // Fetch real statistics data from APIs
  const fetchStatisticsData = async () => {
    try {
      setStatisticsData(prev => ({ ...prev, loading: true }))

      // Fetch data from multiple endpoints in parallel
      const [activitiesRes, participantsRes, pointsRes] = await Promise.all([
        fetch('/api/stats/total-activities'),
        fetch('/api/stats/total-participants'),
        fetch('/api/stats/total-points')
      ])

      const [activitiesData, participantsData, pointsData] = await Promise.all([
        activitiesRes.json(),
        participantsRes.json(),
        pointsRes.json()
      ])

      setStatisticsData({
        totalActivities: activitiesData.totalActivities || 0,
        totalParticipants: participantsData.totalParticipants || 0,
        totalPoints: pointsData.totalPoints || 0,
        activeRegions: pointsData.activeRegions || 0,
        loading: false
      })

    } catch (error) {
      console.error('Error fetching statistics data:', error)
      setStatisticsData(prev => ({ ...prev, loading: false }))
    }
  }

  // Fetch real popular activities data from API
  const fetchPopularActivitiesData = async () => {
    try {
      setPopularActivitiesData(prev => ({ ...prev, loading: true }))

      const response = await fetch('/api/activities/popular')
      const data = await response.json()

      if (data.success && data.popularActivities) {
        // Add colors to the activities
        const colors = ['#16a34a', '#2563eb', '#9333ea', '#ea580c', '#dc2626']
        const activitiesWithColors = data.popularActivities.map((activity: any, index: number) => ({
          ...activity,
          color: colors[index] || '#6b7280'
        }))

        setPopularActivitiesData({
          activities: activitiesWithColors,
          loading: false
        })
      } else {
        console.error('Failed to fetch popular activities:', data.error)
        setPopularActivitiesData(prev => ({ ...prev, loading: false }))
      }

    } catch (error) {
      console.error('Error fetching popular activities data:', error)
      setPopularActivitiesData(prev => ({ ...prev, loading: false }))
    }
  }

  // Fetch real province data from API
  const fetchProvinceData = async () => {
    try {
      setProvinceDataLoading(true)

      const response = await fetch('/api/provinces/stats')
      const data = await response.json()

      if (data.success && data.provinces) {
        // Add default coordinates and positions for provinces
        const provincesWithCoordinates = data.provinces.map((province: any) => {
          // Map province names to coordinates (you can expand this mapping)
          const coordinateMapping: { [key: string]: { coordinates: [number, number]; position: { x: number; y: number } } } = {
            'DKI_JAKARTA': { coordinates: [106.8456, -6.2088], position: { x: 52, y: 62 } },
            'JAWA_BARAT': { coordinates: [107.6191, -6.9175], position: { x: 54, y: 65 } },
            'JAWA_TIMUR': { coordinates: [112.7521, -7.2575], position: { x: 62, y: 67 } },
            'JAWA_TENGAH': { coordinates: [110.1403, -7.1500], position: { x: 58, y: 66 } },
            'SUMATERA_UTARA': { coordinates: [98.6722, 3.5952], position: { x: 25, y: 25 } },
            'SUMATERA_BARAT': { coordinates: [100.6531, -0.7893], position: { x: 22, y: 45 } },
            'RIAU': { coordinates: [101.7068, 0.2933], position: { x: 28, y: 42 } },
            'KALIMANTAN_TIMUR': { coordinates: [116.8392, 1.6753], position: { x: 75, y: 40 } },
            'SULAWESI_SELATAN': { coordinates: [119.9740, -3.6687], position: { x: 78, y: 55 } },
            'BALI': { coordinates: [115.1889, -8.4095], position: { x: 65, y: 70 } },
            'SUMATERA_SELATAN': { coordinates: [103.9140, -3.3194], position: { x: 25, y: 52 } },
            'KALIMANTAN_SELATAN': { coordinates: [115.2838, -3.0926], position: { x: 70, y: 52 } },
            'PAPUA': { coordinates: [138.0804, -4.2699], position: { x: 85, y: 50 } },
            'NUSA_TENGGARA_BARAT': { coordinates: [117.3616, -8.6529], position: { x: 68, y: 72 } },
            'LAMPUNG': { coordinates: [105.4068, -4.5585], position: { x: 28, y: 58 } }
          }

          const mapping = coordinateMapping[province.id] || {
            coordinates: [0, 0] as [number, number],
            position: { x: 0, y: 0 }
          }

          return {
            ...province,
            coordinates: mapping.coordinates,
            position: mapping.position,
            growth: '+0%' // Default growth for now
          }
        })

        setProvinceData(provincesWithCoordinates)
        setProvinceDataLoading(false)
      } else {
        console.error('Failed to fetch province data:', data.error)
        setProvinceDataLoading(false)
      }

    } catch (error) {
      console.error('Error fetching province data:', error)
      setProvinceDataLoading(false)
    }
  }

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
    if (!isClient || mapInstanceRef.current || provinceDataLoading || provinceData.length === 0) return

    const initializeMap = async () => {
      console.log('Initializing map with', provinceData.length, 'provinces...')
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
  }, [isClient, provinceData, provinceDataLoading]) // Add dependencies for province data

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
      <div className="bg-tealLight from-green-500 to-blue-500 text-white rounded-lg p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-2">Peta Persebaran Aktivitas</h1>
        <p>Visualisasi real-time aktivitas hijau di seluruh Indonesia dengan data saturation heatmap</p>
      </div>

      {/* Main Content */}
      <div className={`grid gap-6 ${isMapFullscreen ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
        {/* Enhanced Map */}
        <div className={`${isMapFullscreen ? 'col-span-1' : 'lg:col-span-2'}`}>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-greenDark mb-2">
                Peta Persebaran Kegiatan Hijau Indonesia
              </h2>
              <p className="text-left text-xs text-gray-600 italic">
                Klik provinsi untuk melihat detail
              </p>
            </div>

            <div className={`relative rounded-lg overflow-hidden ${isMapFullscreen ? 'h-[80vh]' : 'h-96'}`} style={{ zIndex: 1 }}>
              <SimpleLeafletMap
                isClient={isClient}
                mapRef={mapRef}
                provinceCount={provinceData.length}
                totalActivities={provinceData.reduce((sum, p) => sum + p.totalActivities, 0)}
                formatNumber={formatNumber}
              />

              {/* Show loading state for map */}
              {(provinceDataLoading || provinceData.length === 0) && (
                <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Memuat data provinsi...</p>
                  </div>
                </div>
              )}

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
              <div className="bg-whiteMint rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center text-greenDark">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  {selectedProvinceData.name}
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-yellowGold/40 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {formatNumber(selectedProvinceData.totalPoints)}
                      </div>
                      <div className="text-sm text-gray-600">Total Poin</div>
                    </div>
                    <div className="text-center p-3 bg-tealLight/40 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatNumber(selectedProvinceData.participants)}
                      </div>
                      <div className="text-sm text-gray-600">Peserta</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-pinkSoft/80 rounded">
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
                </div>
              </div>
              ) : (
              <div className="bg-whiteMint rounded-lg shadow-lg p-6">
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
            <div className="bg-whiteMint rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Aktivitas Terpopuler</h3>
                {popularActivitiesData.loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                )}
              </div>
              <div className="space-y-3">
                {popularActivitiesData.loading ? (
                  <div className="text-center text-gray-500 py-4">
                    Memuat data aktivitas...
                  </div>
                ) : popularActivitiesData.activities.length > 0 ? (
                  popularActivitiesData.activities.map((activity, index) => (
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
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    Belum ada data aktivitas
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Summary */}
      <div className="bg-whiteMint rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Ringkasan Nasional</h2>
          {statisticsData.loading && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
              Memuat data...
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {statisticsData.loading ? '...' : formatNumber(statisticsData.totalActivities)}
            </div>
            <div className="text-gray-600">Total Aktivitas</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {statisticsData.loading ? '...' : formatNumber(statisticsData.totalParticipants)}
            </div>
            <div className="text-gray-600">Total Peserta</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {statisticsData.loading ? '...' : formatNumber(statisticsData.totalPoints)}
            </div>
            <div className="text-gray-600">Total Poin</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-yellowGold">
              {statisticsData.loading ? '...' : statisticsData.activeRegions}
            </div>
            <div className="text-gray-600">Region Aktif</div>
          </div>
        </div>
      </div>

      {/* PDF Report Download Section */}
      <div className="bg-whiteMint rounded-lg shadow-lg p-6">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Laporan Aktivitas Hijau Indonesia</h2>
              <p className="text-sm text-gray-600 mt-1">Generate laporan komprehensif dalam format PDF</p>
            </div>
          </div>

          {/* Report Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Time Period Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Periode Laporan</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="week">7 Hari Terakhir</option>
                <option value="month">30 Hari Terakhir</option>
                <option value="year">Tahun Ini</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-end">
            <button
              onClick={() => {
                // TODO: Implement PDF generation
                alert('Fitur generate PDF akan segera tersedia! Saat ini menggunakan download JSON sebagai alternatif.')
              }}
              className="flex items-center justify-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              <Download className="w-5 h-5 mr-2" />
              Unduh Laporan PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersebaranPage
