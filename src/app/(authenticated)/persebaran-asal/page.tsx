'use client'

import React, { useEffect, useState, useRef } from 'react'


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

const ActivitiesMapPage = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [provinces, setProvinces] = useState<ProvinceStats[]>([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [errorActivities, setErrorActivities] = useState<string | null>(null)
  const [errorProvinces, setErrorProvinces] = useState<string | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null)
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapType, setMapType] = useState<'marker' | 'heatmap'>('marker')
  
  // Menggunakan useRef untuk menyimpan instance peta
  const mapRef = useRef<any>(null)
  // Menggunakan useRef untuk menyimpan layer heatmap
  const heatLayerRef = useRef<any>(null)
  // Menggunakan useRef untuk menyimpan marker
  const markerLayerRef = useRef<any>(null)

  // Fetch data
  useEffect(() => {
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

    fetchActivities()
    fetchProvinces()
  }, [])

  // Initialize map after data is loaded or mapType changes
  useEffect(() => {
    if (!loadingActivities) {
      if (typeof window !== 'undefined') {
        loadLeafletAndCreateMap()
      }
    }
  }, [loadingActivities, mapType, activities])

  const loadLeafletAndCreateMap = () => {
    // Memastikan skrip leaflet sudah dimuat
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
          heatScript.onload = () => createMap()
          document.head.appendChild(heatScript)
        } else {
          createMap()
        }
      }
      document.head.appendChild(script)
    } else {
      // Skrip sudah dimuat, langsung buat peta
      if (mapType === 'heatmap' && !(window as any).L.heatLayer) {
        const heatScript = document.createElement('script')
        heatScript.src = 'https://cdn.jsdelivr.net/npm/leaflet.heat@0.2.0/dist/leaflet-heat.js'
        heatScript.onload = () => createMap()
        document.head.appendChild(heatScript)
      } else {
        createMap()
      }
    }
  }

  const createMap = () => {
    const L = (window as any).L
    if (!L) return

    // Hancurkan instance peta yang sudah ada sebelum membuat yang baru
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    // Pastikan elemen DOM peta ada
    const mapContainer = document.getElementById('map')
    if (!mapContainer) return

    try {
      // Inisialisasi peta
      const map = L.map('map').setView([-2.5, 118], 5)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      // Filter activities with valid coordinates
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
             gradient: { 0: '#004d00' }
             // gradient: { 0.2: '#a5ff13', 0.5: '#44b52b', 1.0: '#1d6f0f' }
            }).addTo(map)
      }

      setMapReady(true)
    } catch (e) {
      console.error("Error creating map:", e)
      setMapReady(false)
    }
  }

  // Get category color
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

  const validActivitiesCount = activities.filter(activity =>
    activity.latitude !== null && activity.longitude !== null
  ).length

  // Fungsi untuk toggle detail provinsi di tabel
  const handleProvinceDetailToggle = (provinceId: string) => {
    setSelectedProvinceId(selectedProvinceId === provinceId ? null : provinceId)
  }

  // Fungsi untuk mendapatkan statistik tambahan per provinsi
  const getProvinceExtraStats = (provinceName: string) => {
    const provinceActivities = activities.filter(act => act.province === provinceName)
    const activitiesWithoutCoords = provinceActivities.filter(act => act.latitude === null || act.longitude === null).length
    const latestActivity = provinceActivities.length > 0
      ? new Date(provinceActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at).toLocaleDateString('id-ID')
      : 'N/A'

    // Hitung aktivitas terbanyak (most frequent activity)
    const activityCount: { [key: string]: number } = {};
    provinceActivities.forEach(act => {
      const categoryName = act.activity_categories.name;
      activityCount[categoryName] = (activityCount[categoryName] || 0) + 1;
    });
    
    let mostFrequentActivity = 'N/A';
    let maxCount = 0;
    for (const category in activityCount) {
      if (activityCount[category] > maxCount) {
        maxCount = activityCount[category];
        mostFrequentActivity = category;
      }
    }

    // Rata-rata poin per aktivitas
    const totalPoints = provinceActivities.reduce((sum, act) => sum + act.points, 0)
    const avgPointsPerActivity = provinceActivities.length > 0 ? (totalPoints / provinceActivities.length).toFixed(2) : '0.00'

    return {
      activitiesWithoutCoords,
      mostFrequentActivity,
      avgPointsPerActivity,
      latestActivity
    }
  }

  return (
    <div className="min-h-screen bg-mintPastel font-poppins">
      {/* Header */}
      <div className="bg-whiteMint shadow-md border-b border-whiteGreen  mx-16 rounded-md px-2">
        <div className="w-full  px-4 py-6">
          <h1 className="text-3xl font-bold text-oliveDark">Peta Aktivitas Indonesia</h1>
          <p className="text-oliveSoft mt-2">
            Visualisasi geografis dari semua aktivitas yang terdaftar di platform
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-whiteMint rounded-xl shadow-lg p-5">
            <h3 className="text-sm font-medium text-oliveSoft">Total Aktivitas</h3>
            <p className="text-3xl font-extrabold text-oliveDark">{activities.length}</p>
          </div>
          <div className="bg-whiteMint rounded-xl shadow-lg p-5">
            <h3 className="text-sm font-medium text-oliveSoft">Aktivitas Berkoordinat</h3>
            <p className="text-3xl font-extrabold text-greenDark">{validActivitiesCount}</p>
          </div>
          <div className="bg-whiteMint rounded-xl shadow-lg p-5">
            <h3 className="text-sm font-medium text-oliveSoft">Total Provinsi</h3>
            <p className="text-3xl font-extrabold text-tealLight">{provinces.length}</p>
          </div>
          <div className="bg-whiteMint rounded-xl shadow-lg p-5">
            <h3 className="text-sm font-medium text-oliveSoft">Total Poin</h3>
            <p className="text-3xl font-extrabold text-yellowGold">
              {activities.reduce((sum, act) => sum + act.points, 0)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Map Section */}
            <div className="bg-whiteMint rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-whiteGreen">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-oliveDark">Peta Sebaran Aktivitas</h2>
                    <p className="text-sm text-oliveSoft mt-1">
                      {mapType === 'marker' ? 'Klik pada titik untuk melihat detail aktivitas' : 'Kerapatan warna menunjukkan konsentrasi aktivitas'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setMapType('marker')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                        ${mapType === 'marker' ? 'bg-greenDark text-white shadow-md' : 'bg-whiteGreen text-oliveDark hover:bg-whiteGreen/80'}`}
                    >
                      Marker
                    </button>
                    <button
                      onClick={() => setMapType('heatmap')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                        ${mapType === 'heatmap' ? 'bg-greenDark text-white shadow-md' : 'bg-whiteGreen text-oliveDark hover:bg-whiteGreen/80'}`}
                    >
                      Heatmap
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
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
                  <div className="relative">
                    <div
                      id="map"
                      className="h-96 w-full rounded-xl border border-whiteGreen"
                      style={{ minHeight: '400px' }}
                    ></div>
                    {!mapReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-whiteMint bg-opacity-75 rounded-xl">
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
          </div>

          {/* Sidebar Section */}
          <div className="space-y-8">
            {/* Selected Activity Details */}
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

            {/* Top 5 Provinces List */}
            <div className="bg-whiteMint rounded-xl shadow-lg">
              <div className="p-6 border-b border-whiteGreen">
                <h3 className="text-xl font-bold text-oliveDark">Top 5 Peringkat Provinsi</h3>
              </div>
              <div className="p-6 space-y-4">
                {loadingProvinces ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tealLight mx-auto mb-2"></div>
                    <p className="text-sm text-oliveSoft">Loading...</p>
                  </div>
                ) : errorProvinces ? (
                  <p className="text-red-500 text-sm">Error: {errorProvinces}</p>
                ) : provinces.length === 0 ? (
                  <p className="text-oliveSoft text-sm">Tidak ada data provinsi</p>
                ) : (
                  <div className="space-y-3">
                    {provinces.slice(0, 5).map((province) => (
                      <div
                        key={province.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-whiteGreen hover:shadow-md"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md
                            ${province.rank === 1 ? 'bg-yellowGold text-white' :
                              province.rank === 2 ? 'bg-oliveSoft text-white' :
                              province.rank === 3 ? 'bg-tealLight text-white' :
                              'bg-mintPastel text-oliveDark'}
                          `}>
                            {province.rank || '-'}
                          </div>
                          <div>
                            <p className="font-semibold text-lg text-greenDark">{province.province}</p>
                            <p className="text-xs text-oliveSoft mt-0.5">{province.total_activities} aktivitas</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-yellowGold">{province.total_points}</p>
                          <p className="text-xs text-oliveSoft">poin</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/*
          ==================================================
          Statistik Lengkap Seluruh Provinsi - Bagian Terpisah di Bawah Peta
          ==================================================
        */}
        <div className="mt-8 bg-whiteMint rounded-xl shadow-lg p-6">
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
                                    <span className="font-bold">Aktivitas Tanpa Koordinat:</span>
                                    <p>{extraStats.activitiesWithoutCoords}</p>
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
      </div>
    </div>
  )
}

export default ActivitiesMapPage