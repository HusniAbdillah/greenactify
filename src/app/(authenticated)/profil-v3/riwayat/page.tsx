'use client'

import React, { useState } from 'react'
import { Calendar, Filter, Search, MapPin, Share2, Download, TrendingUp } from 'lucide-react'

const RiwayatPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'week' | 'month' | 'year'>('all')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'environmental' | 'recycling' | 'transportation'>('all')

  const activities = [
    {
      id: 1,
      type: 'Tanam Pohon',
      category: 'environmental',
      points: 50,
      date: '2025-01-22',
      location: 'Taman Suropati',
      image: '/images/plant1.jpg',
      co2Saved: 5.2
    },
    {
      id: 2,
      type: 'Daur Ulang Plastik',
      category: 'recycling',
      points: 20,
      date: '2025-01-21',
      location: 'Rumah',
      image: '/images/recycle1.jpg',
      co2Saved: 1.5
    },
    {
      id: 3,
      type: 'Bersepeda ke Kantor',
      category: 'transportation',
      points: 30,
      date: '2025-01-20',
      location: 'Jakarta Pusat',
      image: '/images/bike1.jpg',
      co2Saved: 3.8
    },
    {
      id: 4,
      type: 'Bersih-bersih Pantai',
      category: 'environmental',
      points: 40,
      date: '2025-01-19',
      location: 'Pantai Ancol',
      image: '/images/beach1.jpg',
      co2Saved: 2.1
    },
    {
      id: 5,
      type: 'Kompos Organik',
      category: 'recycling',
      points: 25,
      date: '2025-01-18',
      location: 'Rumah',
      image: '/images/compost1.jpg',
      co2Saved: 2.3
    },
    // Add more activities...
  ]

  const categories = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'environmental', label: 'Lingkungan' },
    { value: 'recycling', label: 'Daur Ulang' },
    { value: 'transportation', label: 'Transportasi' },
  ]

  const timeFilters = [
    { value: 'all', label: 'Semua Waktu' },
    { value: 'week', label: '7 Hari Terakhir' },
    { value: 'month', label: '30 Hari Terakhir' },
    { value: 'year', label: 'Tahun Ini' },
  ]

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory
    
    // Time filter logic would be implemented here
    const matchesTime = true // Simplified for now
    
    return matchesSearch && matchesCategory && matchesTime
  })

  const totalPoints = filteredActivities.reduce((sum, activity) => sum + activity.points, 0)
  const totalCO2Saved = filteredActivities.reduce((sum, activity) => sum + activity.co2Saved, 0)

  const handleShare = (activity: any) => {
    if (navigator.share) {
      navigator.share({
        title: 'GreenActify',
        text: `Saya baru saja menyelesaikan aktivitas ${activity.type} dan mendapat ${activity.points} poin!`,
        url: window.location.href
      })
    }
  }

  const handleDownloadReport = () => {
    // Generate and download report
    const reportData = {
      totalActivities: filteredActivities.length,
      totalPoints,
      totalCO2Saved,
      activities: filteredActivities
    }
    
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `greenactify-report-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Riwayat Aktivitas</h1>
        <p>Lihat kembali perjalanan hijau Anda</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{filteredActivities.length}</div>
          <div className="text-gray-600">Total Aktivitas</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{totalPoints.toLocaleString()}</div>
          <div className="text-gray-600">Total Poin</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{totalCO2Saved.toFixed(1)}</div>
          <div className="text-gray-600">kg CO₂ Diselamatkan</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari aktivitas atau lokasi..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          {/* Time Filter */}
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {timeFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>

          {/* Download Report */}
          <button
            onClick={handleDownloadReport}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Unduh Laporan
          </button>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Tidak ada aktivitas ditemukan</h3>
            <p className="text-gray-500">Coba ubah filter atau kata kunci pencarian Anda</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-4">
                {/* Activity Image */}
                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600"></div>
                </div>
                
                {/* Activity Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{activity.type}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(activity.date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {activity.location}
                        </span>
                      </div>
                      
                      {/* Impact Stats */}
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span className="font-semibold">+{activity.points} poin</span>
                        </div>
                        <div className="flex items-center text-blue-600">
                          <span className="text-lg mr-1">🌱</span>
                          <span className="font-semibold">{activity.co2Saved} kg CO₂</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <button
                      onClick={() => handleShare(activity)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {filteredActivities.length > 0 && (
        <div className="text-center">
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Muat Lebih Banyak
          </button>
        </div>
      )}

      {/* Mobile bottom padding */}
      <div className="md:hidden h-20"></div>
    </div>
  )
}

export default RiwayatPage