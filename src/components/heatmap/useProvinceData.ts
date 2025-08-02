'use client'

import { useState, useEffect } from 'react'
import { ProvinceData } from './types'

interface UseProvinceDataReturn {
  provinceData: ProvinceData[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useProvinceData = (): UseProvinceDataReturn => {
  const [provinceData, setProvinceData] = useState<ProvinceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProvinceData = async () => {
    try {
      setLoading(true)
      setError(null)

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
      } else {
        setError(data.error || 'Failed to fetch province data')
      }
    } catch (error) {
      console.error('Error fetching province data:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProvinceData()
  }, [])

  return {
    provinceData,
    loading,
    error,
    refetch: fetchProvinceData
  }
}
