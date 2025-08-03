'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Users, TrendingUp, Filter, Calendar, Download, Eye, Activity, BarChart3, ExternalLink } from 'lucide-react'
import { HeatmapWidget, useProvinceData, ProvinceData } from '@/components/heatmap'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

export type ActivityItem = {
  id: string
  title: string
  province: string | null
  points: number
  latitude: number | null
  longitude: number | null
  created_at: string
  activity_categories: {
    name: string
  }
}

export type ProvinceStats = {
  id: string
  province: string
  total_users: number
  total_activities: number
  total_points: number
  avg_points_per_user: number
  rank: number | null
  coordinates: Record<string, any> | null
  updated_at: string
}

const UnifiedActivitiesPage = () => {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()

  const [viewMode, setViewMode] = useState<'province' | 'activities'>('province')
  const [mapType, setMapType] = useState<'marker' | 'heatmap'>('heatmap')
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null)
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('month')
  const [isMapFullscreen, setIsMapFullscreen] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [isClient, setIsClient] = useState(false)

  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [provinces, setProvinces] = useState<ProvinceStats[]>([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [errorActivities, setErrorActivities] = useState<string | null>(null)
  const [errorProvinces, setErrorProvinces] = useState<string | null>(null)

  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef<any>(null)
  const heatLayerRef = useRef<any>(null)
  const markerLayerRef = useRef<any>(null)
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null)

  const { provinceData, loading: provinceDataLoading, error: provinceError } = useProvinceData()

  const [statisticsData, setStatisticsData] = useState({
    totalActivities: 0,
    totalParticipants: 0,
    totalPoints: 0,
    activeRegions: 0,
    loading: true
  })

  const [popularActivitiesData, setPopularActivitiesData] = useState({
    activities: [] as Array<{ name: string; count: number; percentage: number; color: string }>,
    loading: true
  })

  // Check authentication
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    setIsClient(true)
    setLastUpdate(new Date().toLocaleString('id-ID'))
    fetchStatisticsData()
    fetchPopularActivitiesData()
    fetchActivities()
    fetchProvinces()
  }, [])

  useEffect(() => {
    if (viewMode === 'activities' && !loadingActivities) {
      if (typeof window !== 'undefined') {
        loadLeafletAndCreateMap()
      }
    }

    return () => {
      if (mapRef.current && viewMode !== 'activities') {
        try {
          mapRef.current.remove()
          mapRef.current = null
          setMapReady(false)
        } catch (e) {
          console.log('Map cleanup error:', e)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, loadingActivities, mapType, activities])

  const fetchActivities = async () => {
    setLoadingActivities(true)
    try {
      const res = await fetch('/api/activities/getAll')
      const result = await res.json()

      if (!res.ok || result.error) {
        setErrorActivities(result.error || 'Gagal mengambil data aktivitas')
        setActivities([])
      } else {
        setActivities(result.data || [])
      }
    } catch (err) {
      setErrorActivities('Terjadi kesalahan saat mengambil aktivitas')
      setActivities([])
    } finally {
      setLoadingActivities(false)
    }
  }

  const fetchProvinces = async () => {
    setLoadingProvinces(true)
    try {
      const res = await fetch('/api/province-bare')
      const result = await res.json()

      if (!res.ok || result.error) {
        setErrorProvinces(result.error || 'Gagal mengambil data provinsi')
        setProvinces([])
      } else {
        const sortedProvinces = result.data.sort((a: ProvinceStats, b: ProvinceStats) =>
          (a.rank || Infinity) - (b.rank || Infinity)
        )
        setProvinces(sortedProvinces)
      }
    } catch (err) {
      setErrorProvinces('Terjadi kesalahan saat mengambil provinsi')
      setProvinces([])
    } finally {
      setLoadingProvinces(false)
    }
  }

  const fetchStatisticsData = async () => {
    try {
      setStatisticsData(prev => ({ ...prev, loading: true }))

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

  const fetchPopularActivitiesData = async () => {
    try {
      setPopularActivitiesData(prev => ({ ...prev, loading: true }))

      const response = await fetch('/api/activities/popular')
      const data = await response.json()

      if (data.success && data.popularActivities) {
        const colors = ['#16a34a', '#2563eb', '#9333ea', '#ea580c', '#dc2626', '#059669', '#7c3aed', '#db2777', '#c2410c', '#1d4ed8']
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

  const loadLeafletAndCreateMap = () => {
    if (!(window as any).L) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'
      script.onload = () => {
        if (mapType === 'heatmap' && !(window as any).L.heatLayer) {
          const heatScript = document.createElement('script')
          heatScript.src = 'https://cdn.jsdelivr.net/npm/leaflet.heat@0.2.0/dist/leaflet-heat.js'
          heatScript.onload = () => createActivityMap()
          document.head.appendChild(heatScript)
        } else {
          createActivityMap()
        }
      }
      document.head.appendChild(script)
    } else {
      if (mapType === 'heatmap' && !(window as any).L.heatLayer) {
        const heatScript = document.createElement('script')
        heatScript.src = 'https://cdn.jsdelivr.net/npm/leaflet.heat@0.2.0/dist/leaflet-heat.js'
        heatScript.onload = () => createActivityMap()
        document.head.appendChild(heatScript)
      } else {
        createActivityMap()
      }
    }
  }

  const createActivityMap = () => {
    const L = (window as any).L
    if (!L) return

    if (mapRef.current) {
      try {
        mapRef.current.remove()
      } catch (e) {
        console.log('Error removing existing map:', e)
      }
      mapRef.current = null
    }

    if (heatLayerRef.current) {
      heatLayerRef.current = null
    }
    if (markerLayerRef.current) {
      markerLayerRef.current = null
    }

    const mapContainer = document.getElementById('activity-map')
    if (!mapContainer) return

    mapContainer.innerHTML = ''

    try {
      setMapReady(false)

      const map = L.map('activity-map').setView([-2.5, 118], 5)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      const validActivities = activities.filter(activity =>
        activity.latitude !== null &&
        activity.longitude !== null &&
        !isNaN(activity.latitude) &&
        !isNaN(activity.longitude)
      )

      if (mapType === 'marker') {
        const markers = validActivities.map((activity) => {
          const marker = L.marker([activity.latitude!, activity.longitude!])
            .bindPopup(`
              <div class="p-2 min-w-[200px]">
                <h3 class="font-bold text-sm mb-1">${activity.title}</h3>
                <p class="text-xs text-gray-600 mb-1">
                  ${activity.activity_categories.name}
                </p>
                <p class="text-xs text-gray-600 mb-1">
                  ${activity.province || 'Tanpa Provinsi'}
                </p>
                <p class="text-xs font-medium text-green-600">
                  +${activity.points} poin
                </p>
                <p class="text-xs text-gray-400">
                  ${new Date(activity.created_at).toLocaleString('id-ID')}
                </p>
              </div>
            `)
          marker.on('click', () => setSelectedActivity(activity))
          return marker
        })
        markerLayerRef.current = L.layerGroup(markers).addTo(map)
      } else if (mapType === 'heatmap' && L.heatLayer) {
        const heatPoints = validActivities.map(activity => [activity.latitude!, activity.longitude!])
        heatLayerRef.current = L.heatLayer(heatPoints, {
          radius: 25,
          gradient: { 0.2: '#a5ff13', 0.5: '#44b52b', 1.0: '#1d6f0f' }
        }).addTo(map)
      }

      setMapReady(true)
    } catch (e) {
      console.error("Error creating map:", e)
      setMapReady(false)
    }
  }

  const handleProvinceClick = (province: ProvinceData | null) => {
    setSelectedProvince(province?.id || null)
  }

  const handleProvinceDetailToggle = (provinceId: string) => {
    setSelectedProvinceId(selectedProvinceId === provinceId ? null : provinceId)
  }

  const getCategoryColor = (categoryName: string) => {
    const colors = {
      'Lingkungan': 'bg-green-100 text-green-800',
      'Sosial': 'bg-blue-100 text-blue-800',
      'Ekonomi': 'bg-yellow-100 text-yellow-800',
      'Pendidikan': 'bg-purple-100 text-purple-800',
      'Kesehatan': 'bg-red-100 text-red-800',
      'Teknologi': 'bg-indigo-100 text-indigo-800',
    }
    return colors[categoryName as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getProvinceExtraStats = (provinceName: string) => {
    const provinceActivities = activities.filter(act => act.province === provinceName)

    const highPointCount = provinceActivities.filter(act => act.points >= 50).length
    const highPointPercentage = provinceActivities.length > 0
      ? ((highPointCount / provinceActivities.length) * 100).toFixed(1) + '%'
      : '0%'

    const latestActivity = provinceActivities.length > 0
      ? new Date(provinceActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at).toLocaleDateString('id-ID')
      : 'N/A'

    const activityCount: { [key: string]: number } = {}
    provinceActivities.forEach(act => {
      const categoryName = act.activity_categories.name
      activityCount[categoryName] = (activityCount[categoryName] || 0) + 1
    })

    let mostFrequentActivity = 'N/A'
    let maxCount = 0
    for (const category in activityCount) {
      if (activityCount[category] > maxCount) {
        maxCount = activityCount[category]
        mostFrequentActivity = category
      }
    }

    const totalPoints = provinceActivities.reduce((sum, act) => sum + act.points, 0)
    const avgPointsPerActivity = provinceActivities.length > 0 ? (totalPoints / provinceActivities.length).toFixed(2) : '0.00'

    return {
      highPointPercentage,
      mostFrequentActivity,
      avgPointsPerActivity,
      latestActivity
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Provinsi", "Total Pengguna", "Total Aktivitas", "Total Poin",
      "Rata2 Poin/User", "Aktivitas Berpoin Tinggi (%)", "Aktivitas Terbanyak",
      "Rata2 Poin/Aktivitas", "Aktivitas Terbaru"
    ]

    const rows = provinces.map(prov => {
      const extra = getProvinceExtraStats(prov.province)
      return [
        prov.province,
        prov.total_users,
        prov.total_activities,
        prov.total_points,
        prov.avg_points_per_user,
        extra.highPointPercentage,
        extra.mostFrequentActivity,
        extra.avgPointsPerActivity,
        extra.latestActivity
      ]
    })

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "Laporan Dampak GreenActify.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    const logoUrl = '/logo-greenactify.png'
    const img = new window.Image()
    img.src = logoUrl
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth()

      const logoWidth = 60
      const logoX = (pageWidth - logoWidth) / 2
      doc.addImage(img, 'PNG', logoX, 10, logoWidth, 20)


      doc.setFontSize(16)
      doc.setTextColor(34, 78, 64)
      doc.setFont('helvetica', 'bold')
      doc.text('Dampak GreenActify Terhadap Aksi Pro-Lingkungan', pageWidth / 2, 40, {
        align: 'center'
      })

      const tableData = provinces.map(prov => {
        const extra = getProvinceExtraStats(prov.province)
        return [
          prov.province,
          prov.total_users,
          prov.total_activities,
          prov.total_points,
          prov.avg_points_per_user,
          extra.highPointPercentage,
          extra.mostFrequentActivity,
          extra.avgPointsPerActivity,
          extra.latestActivity
        ]
      })

      autoTable(doc, {
        startY: 45,
        head: [[
          "Provinsi", "Total Pengguna", "Total Aktivitas", "Total Poin",
          "Rata2 Poin/User", "Aktivitas Berpoin Tinggi (%)", "Aktivitas Terbanyak",
          "Rata2 Poin/Aktivitas", "Aktivitas Terbaru"
        ]],
        body: tableData,
        styles: {
          fontSize: 7,
          halign: 'center',
          valign: 'middle',
          cellPadding: 3
        },
        headStyles: {
          fillColor: [12, 59, 46],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: [0,0,0]
        },
        alternateRowStyles: {
          fillColor: [240, 253, 244]
        },
        tableLineColor: [200, 250, 200],
        tableLineWidth: 0.2
      })

      doc.save('Dampak GreenActify.pdf')
    }
  }

  const formatNumber = (num: number) => {
    if (!isClient) return num.toString()
    return num.toLocaleString('id-ID')
  }

  const selectedProvinceData = provinceData.find(p => p.id === selectedProvince)
  const validActivitiesCount = activities.filter(activity =>
    activity.latitude !== null && activity.longitude !== null
  ).length

  return (
    <div className="min-h-screen bg-mintPastel font-poppins pt-6">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      <div className="bg-tealLight text-white rounded-lg p-4 sm:p-6 mx-6 mb-0 sm:mb-4 md:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Peta Persebaran Aktivitas Hijau Indonesia</h1>
        <p  className=' text-sm sm:text-base '>Visualisasi komprehensif aktivitas hijau di seluruh Indonesia dengan data real-time</p>

        <div className=" mt-4 flex space-x-2">
          <button
            onClick={() => setViewMode('province')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === 'province'
                ? 'bg-white text-tealLight shadow-md'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Per Provinsi
          </button>
          <button
            onClick={() => setViewMode('activities')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === 'activities'
                ? 'bg-white text-tealLight shadow-md'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Activity className="w-4 h-4 mr-2" />
            Per Aktivitas
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600">
                {statisticsData.loading ? '...' : formatNumber(statisticsData.totalActivities)}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Total Aktivitas</div>
            </div>

            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600">
                {statisticsData.loading ? '...' : formatNumber(statisticsData.totalParticipants)}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Total Peserta</div>
            </div>

            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-600">
                {statisticsData.loading ? '...' : formatNumber(statisticsData.totalPoints)}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Total Poin</div>
            </div>

            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellowGold">
                {statisticsData.loading ? '...' : statisticsData.activeRegions}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Provinsi Aktif</div>
            </div>
          </div>
        </div>

        {viewMode === 'province' && (
          <div className={`grid gap-6 ${isMapFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-5'}`}>
            <div className={`${isMapFullscreen ? 'col-span-1' : 'col-span-1 lg:col-span-4'}`}>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-greenDark mb-2">
                    Peta Persebaran Per Provinsi
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
                  enableFullscreen={false}
                  enableDownload={false}
                  className="w-full"
                  key="province-heatmap"
                />
              </div>
            </div>

            {!isMapFullscreen && (
              <div className="col-span-1 lg:col-span-1">
                <div className="bg-whiteMint rounded-lg shadow-lg h-full">
                  <div className="p-4 border-b border-whiteGreen">
                    <h3 className="text-lg font-bold text-oliveDark">Top 5 Provinsi</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {loadingProvinces ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tealLight mx-auto mb-2"></div>
                        <p className="text-xs text-oliveSoft">Loading...</p>
                      </div>
                    ) : errorProvinces ? (
                      <p className="text-red-500 text-xs">Error: {errorProvinces}</p>
                    ) : provinces.length === 0 ? (
                      <p className="text-oliveSoft text-xs">Tidak ada data provinsi</p>
                    ) : (
                      <div className="space-y-2">
                        {provinces.slice(0, 5).map((province) => (
                          <div
                            key={province.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-whiteGreen hover:shadow-md"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md
                                ${province.rank === 1 ? 'bg-yellowGold text-white' :
                                  province.rank === 2 ? 'bg-oliveSoft text-white' :
                                  province.rank === 3 ? 'bg-tealLight text-white' :
                                  'bg-mintPastel text-oliveDark'}
                              `}>
                                {province.rank || '-'}
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-greenDark">{province.province}</p>
                                <p className="text-xs text-oliveSoft mt-0.5">{province.total_activities} aktivitas</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-yellowGold">{province.total_points}</p>
                              <p className="text-xs text-oliveSoft">poin</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'province' && (
          <div className="grid grid-cols-1">
            {selectedProvinceData ? (
              <div className="bg-whiteMint rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center text-greenDark">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  Detail Provinsi: {selectedProvinceData.name}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </div>
        )}

        {viewMode === 'activities' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
            <div className="lg:col-span-2 space-y-8 min-w-265">
              <div className="bg-whiteMint rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-whiteGreen">

                  <div className="flex justify-between items-center flex-wrap">
                    <div>
                      <h2 className="text-xl font-bold text-oliveDark">Peta Sebaran Per Aktivitas</h2>
                      <p className="text-sm text-oliveSoft mt-1">
                        {mapType === 'marker' ? 'Klik pada titik untuk melihat detail aktivitas' : 'Kerapatan warna menunjukkan konsentrasi aktivitas'}
                      </p>
                    </div>
                    <div className="flex space-x-2">

                      <button
                        onClick={() => setMapType('marker')}
                        className={` mt-3 sm:mt-0 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                          ${mapType === 'marker' ? 'bg-greenDark text-white shadow-md' : 'bg-whiteGreen text-oliveDark hover:bg-whiteGreen/80'}`}
                      >
                        Marker
                      </button>
                      <button
                        onClick={() => setMapType('heatmap')}
                        className={` mt-3 sm:mt-0  px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                          ${mapType === 'heatmap' ? 'bg-greenDark text-white shadow-md' : 'bg-whiteGreen text-oliveDark hover:bg-whiteGreen/80'}`}
                      >
                        Heatmap
                      </button>

                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 overflow-hidden  ">
                  {loadingActivities ? (
                    <div className="h-96 flex items-center justify-center bg-whiteGreen rounded-xl">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tealLight mx-auto mb-4"></div>
                        <p className="text-oliveSoft">Loading aktivitas...</p>
                      </div>
                    </div>
                  ) : errorActivities ? (
                    <div className="h-96 flex items-center justify-center bg-red-100 border border-red-400 rounded-xl">
                      <div className="text-center text-red-600">
                        <p className="font-medium">Error: {errorActivities}</p>
                      </div>
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="h-96 flex items-center justify-center bg-whiteGreen rounded-xl">
                      <p className="text-oliveSoft">Tidak ada aktivitas ditemukan</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden relative pb-[100px] w-full">
                      <div
                        id="activity-map"
                        className="h-96 w-full rounded-xl border border-whiteGreen z-0 "
                          style={{
                            minHeight: '400px',
                            paddingBottom: '80px'
                          }}
                        key={`activity-map-${mapType}-${viewMode}`}
                      ></div>
                      {!mapReady && (
                        <div className=" inset-0 flex items-center justify-center bg-whiteMint bg-opacity-75 rounded-xl">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tealLight mx-auto mb-2"></div>
                            <p className="text-sm text-oliveSoft">Memuat peta...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid  grid-cols-2 sm :grid-cols-4 gap-6">
                <div className="bg-whiteMint rounded-xl shadow-lg p-5">
                  <h3 className="text-sm font-medium text-oliveSoft">Total Aktivitas</h3>
                  <p className="text-2xl sm:text-3xl font-extrabold text-oliveDark">{activities.length}</p>
                </div>
                <div className="bg-whiteMint rounded-xl shadow-lg p-5">
                  <h3 className="text-sm font-medium text-oliveSoft">Aktivitas Berkoordinat</h3>
                  <p className="text-2xl sm:text-3xl font-extrabold text-greenDark">{validActivitiesCount}</p>
                </div>
                <div className="bg-whiteMint rounded-xl shadow-lg p-5">
                  <h3 className="text-sm font-medium text-oliveSoft">Total Provinsi</h3>
                  <p className="text-2xl sm:text-3xl font-extrabold text-tealLight">{provinces.length}</p>
                </div>
                <div className="bg-whiteMint rounded-xl shadow-lg p-5">
                  <h3 className="text-sm font-medium text-oliveSoft">Total Poin</h3>
                  <p className="text-2xl sm:text-3xl font-extrabold text-yellowGold">
                    {activities.reduce((sum, act) => sum + act.points, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {selectedActivity && (
                <div className="bg-whiteMint rounded-xl shadow-lg">
                  <div className="p-6 border-b border-whiteGreen">
                    <h3 className="text-xl font-bold text-oliveDark">Detail Aktivitas</h3>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-lg mb-2 text-greenDark">{selectedActivity.title}</h4>
                    <div className="space-y-3 text-oliveDark">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-oliveSoft">Kategori:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedActivity.activity_categories.name)}`}>
                          {selectedActivity.activity_categories.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-oliveSoft">Provinsi:</span>
                        <span className="text-sm font-medium">{selectedActivity.province || 'Tidak ada'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-oliveSoft">Poin:</span>
                        <span className="text-sm font-bold text-yellowGold">+{selectedActivity.points}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-oliveSoft">Koordinat:</span>
                        <span className="text-xs text-oliveSoft">
                          {selectedActivity.latitude?.toFixed(4)}, {selectedActivity.longitude?.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-oliveSoft">Dibuat:</span>
                        <span className="text-xs text-oliveSoft">
                          {new Date(selectedActivity.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {viewMode === 'activities' && (
                <div className='flex justify-end'>
                <div className="bg-whiteMint rounded-lg shadow-lg p-6 max-w-60">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className=" text-lg font-bold">Top 5 Aktivitas Terpopuler</h3>
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
                      popularActivitiesData.activities.slice(0, 5).map((activity, index) => (
                        <div key={activity.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                              {index + 1}
                            </div>
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: activity.color }}
                            ></div>
                            <span className="font-medium text-sm">{activity.name}</span>
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
          </div>
        )}

        <div className="bg-whiteMint rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-oliveDark border-b border-whiteGreen pb-4 mb-4">
            Statistik Lengkap Seluruh Provinsi
          </h2>
          {loadingProvinces ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tealLight mx-auto mb-4"></div>
              <p className="text-oliveSoft">Memuat data provinsi...</p>
            </div>
          ) : errorProvinces ? (
            <div className="bg-red-50 p-4 rounded-lg text-red-600">
              <p className="font-medium">Error: {errorProvinces}</p>
            </div>
          ) : provinces.length === 0 ? (
            <div className="bg-whiteGreen p-4 rounded-lg text-oliveSoft">
              <p>Tidak ada data provinsi yang ditemukan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-whiteGreen">
                <thead className="bg-whiteGreen">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-oliveDark uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-oliveDark uppercase tracking-wider">
                      Provinsi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-oliveDark uppercase tracking-wider">
                      Total Pengguna
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-oliveDark uppercase tracking-wider">
                      Total Aktivitas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-oliveDark uppercase tracking-wider">
                      Total Poin
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-whiteGreen">
                  {provinces.map((province) => {
                    const extraStats = getProvinceExtraStats(province.province)
                    const isSelected = selectedProvinceId === province.id
                    return (
                      <React.Fragment key={province.id}>
                        <tr
                          onClick={() => handleProvinceDetailToggle(province.id)}
                          className={`cursor-pointer transition-colors duration-200
                            ${isSelected ? 'bg-whiteGreen/80' : 'hover:bg-whiteGreen/50'}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-oliveDark">
                            {province.rank}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-greenDark">
                            {province.province}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-oliveSoft">
                            {province.total_users}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-oliveSoft">
                            {province.total_activities}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-yellowGold">
                            {province.total_points}
                          </td>
                        </tr>
                        {isSelected && (
                          <>
                            <tr className="bg-mintPastel">
                              <td colSpan={5} className="p-4 border-t border-whiteGreen text-oliveDark">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-medium pl-6">
                                  <div>
                                    <span className="font-bold">Total Pengguna:</span>
                                    <p>{province.total_users}</p>
                                  </div>
                                  <div>
                                    <span className="font-bold">Total Aktivitas:</span>
                                    <p>{province.total_activities}</p>
                                  </div>
                                  <div>
                                    <span className="font-bold">Total Poin:</span>
                                    <p>{province.total_points}</p>
                                  </div>
                                  <div>
                                    <span className="font-bold">Rata-rata Poin per Pengguna:</span>
                                    <p>{province.avg_points_per_user.toFixed(2)}</p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                            <tr className="bg-mintPastel">
                              <td colSpan={5} className="p-4 border-t border-whiteGreen text-oliveDark">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-medium pl-6">
                                  <div>
                                    <span className="font-bold">Aktivitas Berpoin Tinggi (%):</span>
                                    <p>{extraStats.highPointPercentage}</p>
                                  </div>
                                  <div>
                                    <span className="font-bold">Aktivitas Terbanyak:</span>
                                    <p>{extraStats.mostFrequentActivity}</p>
                                  </div>
                                  <div>
                                    <span className="font-bold">Rata-rata Poin per Aktivitas:</span>
                                    <p>{extraStats.avgPointsPerActivity}</p>
                                  </div>
                                  <div>
                                    <span className="font-bold">Aktivitas Terbaru:</span>
                                    <p>{extraStats.latestActivity}</p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-whiteMint rounded-lg shadow-lg p-6">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Laporan Aktivitas Hijau Indonesia</h2>
                <p className="text-sm text-gray-600 mt-1">Unduh laporan atau lihat detail analisis per provinsi</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-end">
              <button
                onClick={exportToPDF}
                className="flex items-center justify-center px-6 py-2 bg-red/60 text-white rounded-md hover:bg-red transition-colors font-semibold"
              >
                <Download className="w-5 h-5 mr-2" />
                Unduh PDF
              </button>

              <button
                onClick={exportToCSV}
                className="flex items-center justify-center px-6 py-2 bg-oliveSoft/80 text-white rounded-md hover:bg-oliveSoft transition-colors font-semibold"
              >
                <Download className="w-5 h-5 mr-2" />
                Unduh CSV
              </button>

              <button
                onClick={() => router.push('/unduh-dampak')}
                className="flex items-center justify-center px-6 py-2 bg-greenDark/80 text-white rounded-md hover:bg-greenDark transition-colors font-semibold"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Lihat Detail per Provinsi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnifiedActivitiesPage
