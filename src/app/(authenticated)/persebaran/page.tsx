'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Users, TrendingUp, Filter, Calendar, Download, Eye, ZoomIn } from 'lucide-react'

// Dynamic import untuk menghindari SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

const PersebaranPage = () => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('month')
  const [isMapFullscreen, setIsMapFullscreen] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('') // Add this state

  useEffect(() => {
    setMapLoaded(true)
    setLastUpdate(new Date().toLocaleString('id-ID')) // Set timestamp on client
  }, [])

  const provinceData = [
    {
      id: 'jk',
      name: 'DKI Jakarta',
      code: 'JK',
      totalPoints: 45420,
      totalActivities: 3420,
      participants: 1250,
      averagePerUser: 36.3,
      topActivity: 'Transportasi Umum',
      coordinates: [-6.2088, 106.8456], // [lat, lng]
      growth: '+12%'
    },
    {
      id: 'jb',
      name: 'Jawa Barat',
      code: 'JB',
      totalPoints: 42350,
      totalActivities: 4200,
      participants: 2100,
      averagePerUser: 20.2,
      topActivity: 'Tanam Pohon',
      coordinates: [-6.9175, 107.6191],
      growth: '+8%'
    },
    {
      id: 'jt',
      name: 'Jawa Timur',
      code: 'JT',
      totalPoints: 38200,
      totalActivities: 3800,
      participants: 1800,
      averagePerUser: 21.2,
      topActivity: 'Daur Ulang',
      coordinates: [-7.2575, 112.7521],
      growth: '+15%'
    },
    {
      id: 'jtg',
      name: 'Jawa Tengah',
      code: 'JTG',
      totalPoints: 32100,
      totalActivities: 2900,
      participants: 1650,
      averagePerUser: 19.5,
      topActivity: 'Bersih-bersih',
      coordinates: [-7.1500, 110.1403],
      growth: '+5%'
    },
    {
      id: 'su',
      name: 'Sumatera Utara',
      code: 'SU',
      totalPoints: 28500,
      totalActivities: 2400,
      participants: 1200,
      averagePerUser: 23.8,
      topActivity: 'Konservasi Hutan',
      coordinates: [3.5952, 98.6722],
      growth: '+18%'
    },
    {
      id: 'sb',
      name: 'Sumatera Barat',
      code: 'SB',
      totalPoints: 22300,
      totalActivities: 1850,
      participants: 950,
      averagePerUser: 23.5,
      topActivity: 'Tanam Pohon',
      coordinates: [-0.7893, 100.6531],
      growth: '+10%'
    },
    {
      id: 'ri',
      name: 'Riau',
      code: 'RI',
      totalPoints: 19800,
      totalActivities: 1650,
      participants: 780,
      averagePerUser: 25.4,
      topActivity: 'Reboisasi',
      coordinates: [0.2933, 101.7068],
      growth: '+22%'
    },
    {
      id: 'kal',
      name: 'Kalimantan Timur',
      code: 'KAL',
      totalPoints: 25600,
      totalActivities: 2100,
      participants: 1100,
      averagePerUser: 23.3,
      topActivity: 'Konservasi',
      coordinates: [1.6753, 116.8392],
      growth: '+14%'
    },
    {
      id: 'sul',
      name: 'Sulawesi Selatan',
      code: 'SUL',
      totalPoints: 21400,
      totalActivities: 1750,
      participants: 850,
      averagePerUser: 25.2,
      topActivity: 'Bersih Pantai',
      coordinates: [-3.6687, 119.9740],
      growth: '+16%'
    },
    {
      id: 'bali',
      name: 'Bali',
      code: 'BALI',
      totalPoints: 31200,
      totalActivities: 2650,
      participants: 1350,
      averagePerUser: 23.1,
      topActivity: 'Eco Tourism',
      coordinates: [-8.4095, 115.1889],
      growth: '+20%'
    }
  ]

  const activityTypes = [
    { name: 'Tanam Pohon', count: 2850, color: '#16a34a', percentage: 28 },
    { name: 'Daur Ulang', count: 2100, color: '#2563eb', percentage: 21 },
    { name: 'Transportasi Hijau', count: 1950, color: '#9333ea', percentage: 19 },
    { name: 'Konservasi', count: 1650, color: '#ea580c', percentage: 16 },
    { name: 'Bersih-bersih', count: 1450, color: '#dc2626', percentage: 14 },
  ]

  const getHeatmapColor = (points: number) => {
    if (points > 40000) return '#065f46' // Very high - dark green
    if (points > 30000) return '#16a34a' // High - green
    if (points > 20000) return '#22c55e' // Medium - light green
    if (points > 15000) return '#86efac' // Low - very light green
    return '#dcfce7' // Very low - pale green
  }

  const getHeatmapRadius = (points: number) => {
    if (points > 40000) return 25
    if (points > 30000) return 20
    if (points > 20000) return 15
    if (points > 15000) return 10
    return 8
  }

  const handleProvinceClick = (province: any) => {
    setSelectedProvince(selectedProvince === province.id ? null : province.id)
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

  // Custom marker component
  const ProvinceMarker = ({ province }: { province: any }) => (
    <CircleMarker
      center={province.coordinates}
      radius={getHeatmapRadius(province.totalPoints)}
      fillColor={getHeatmapColor(province.totalPoints)}
      color="white"
      weight={3}
      opacity={1}
      fillOpacity={0.8}
      eventHandlers={{
        click: () => handleProvinceClick(province)
      }}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-bold text-lg mb-2">{province.name}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total Poin:</span>
              <span className="font-semibold text-green-600">
                {province.totalPoints.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Peserta:</span>
              <span className="font-semibold">
                {province.participants.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Aktivitas:</span>
              <span className="font-semibold">
                {province.totalActivities.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Pertumbuhan:</span>
              <span className="font-semibold text-blue-600">
                {province.growth}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t">
              <span className="text-xs text-gray-600">Aktivitas Terpopuler:</span>
              <div className="font-semibold">{province.topActivity}</div>
            </div>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  )

  return (
    <div className="p-6 space-y-6">
      {/* CSS untuk Leaflet */}
      <style jsx global>{`
        .leaflet-container {
          height: 100%;
          width: 100%;
          border-radius: 8px;
        }
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Peta Persebaran Aktivitas</h1>
        <p>Visualisasi real-time aktivitas hijau di seluruh Indonesia</p>
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
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Update terakhir: {lastUpdate || 'Memuat...'}</span> {/* Use state instead */}
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
        {/* Real Map with Leaflet */}
        <div className={`${isMapFullscreen ? 'col-span-1' : 'lg:col-span-2'}`}>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Peta Aktivitas Indonesia</h2>
              <div className="text-sm text-gray-600">
                Klik marker untuk detail
              </div>
            </div>
            
            <div className={`relative rounded-lg overflow-hidden ${isMapFullscreen ? 'h-[80vh]' : 'h-96'}`}>
              {mapLoaded ? (
                <MapContainer
                  center={[-2.5489, 118.0149]} // Center of Indonesia
                  zoom={5}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Province markers */}
                  {provinceData.map((province) => (
                    <ProvinceMarker key={province.id} province={province} />
                  ))}
                </MapContainer>
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat peta...</p>
                  </div>
                </div>
              )}
              
              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg">
                <div className="text-sm font-semibold mb-2">Intensitas Aktivitas</div>
                <div className="space-y-1">
                  {[
                    { color: '#065f46', label: '>40k poin' },
                    { color: '#16a34a', label: '30k-40k' },
                    { color: '#22c55e', label: '20k-30k' },
                    { color: '#86efac', label: '15k-20k' },
                    { color: '#dcfce7', label: '<15k' }
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
                        {selectedProvinceData.totalPoints.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Poin</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedProvinceData.participants.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Peserta</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedProvinceData.totalActivities.toLocaleString()}
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
                  Klik pada marker di peta untuk melihat detail aktivitas per provinsi
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
                      <div className="font-bold text-gray-800">{activity.count.toLocaleString()}</div>
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
              {provinceData.reduce((sum, p) => sum + p.totalActivities, 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Total Aktivitas</div>
            <div className="text-sm text-green-500 font-medium">+12% minggu ini</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {provinceData.reduce((sum, p) => sum + p.participants, 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Total Peserta</div>
            <div className="text-sm text-blue-500 font-medium">+8% minggu ini</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {provinceData.reduce((sum, p) => sum + p.totalPoints, 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Total Poin</div>
            <div className="text-sm text-purple-500 font-medium">+15% minggu ini</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {provinceData.length}
            </div>
            <div className="text-gray-600">Provinsi Aktif</div>
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