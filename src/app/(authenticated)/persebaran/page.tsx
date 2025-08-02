'use client'

import React, { useState, useEffect } from 'react'
import { MapPin, Users, TrendingUp, Filter, Calendar, Download } from 'lucide-react'
import { HeatmapWidget, useProvinceData, ProvinceData } from '@/components/heatmap'
// Main page component
const PersebaranPage = () => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('month')
  const [isMapFullscreen, setIsMapFullscreen] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [isClient, setIsClient] = useState(false)

  // Use the new hook to fetch province data
  const { provinceData, loading: provinceDataLoading, error: provinceError } = useProvinceData()

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

  useEffect(() => {
    setIsClient(true)
    setLastUpdate(new Date().toLocaleString('id-ID'))
    fetchStatisticsData()
    fetchPopularActivitiesData()
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

  // Handle province selection
  const handleProvinceClick = (province: ProvinceData | null) => {
    setSelectedProvince(province?.id || null)
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

  // Format number with locale
  const formatNumber = (num: number) => {
    if (!isClient) return num.toString() // Return plain number during SSR
    return num.toLocaleString('id-ID') // Use Indonesian locale on client
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

            <HeatmapWidget
              provinceData={provinceDataLoading ? [] : provinceData}
              config={{
                height: isMapFullscreen ? '80vh' : '400px',
                colorScheme: 'green',
                dataField: 'totalActivities',
                showLegend: true,
                showSummary: true
              }}
              title="Peta Persebaran Kegiatan Hijau Indonesia"
              description="Klik provinsi untuk melihat detail"
              onProvinceClick={handleProvinceClick}
              selectedProvince={selectedProvince}
              enableFullscreen={false} // We handle fullscreen at the page level
              enableDownload={false}
              className="w-full"
            />
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
