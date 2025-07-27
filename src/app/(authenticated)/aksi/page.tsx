'use client'

import React, { useState } from 'react'
import { Upload, Camera, Search, MapPin, Clock, Share2, Download } from 'lucide-react'

const AksiPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showActivities, setShowActivities] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showPointsModal, setShowPointsModal] = useState(false)
  const [lastUploadTime, setLastUploadTime] = useState<Date | null>(null)

  const categories = [
    {
      id: 'environmental',
      name: 'Lingkungan',
      activities: [
        { id: 1, name: 'Tanam Pohon', points: 50, image: '/images/plant.jpg' },
        { id: 2, name: 'Bersih-bersih Pantai', points: 40, image: '/images/beach.jpg' },
        { id: 3, name: 'Bersih-bersih Sungai', points: 40, image: '/images/river.jpg' },
      ]
    },
    {
      id: 'recycling',
      name: 'Daur Ulang',
      activities: [
        { id: 4, name: 'Daur Ulang Plastik', points: 20, image: '/images/plastic.jpg' },
        { id: 5, name: 'Daur Ulang Kertas', points: 15, image: '/images/paper.jpg' },
        { id: 6, name: 'Kompos Organik', points: 25, image: '/images/compost.jpg' },
      ]
    },
    {
      id: 'transportation',
      name: 'Transportasi',
      activities: [
        { id: 7, name: 'Bersepeda', points: 30, image: '/images/bike.jpg' },
        { id: 8, name: 'Jalan Kaki', points: 20, image: '/images/walk.jpg' },
        { id: 9, name: 'Transportasi Umum', points: 25, image: '/images/public.jpg' },
      ]
    }
  ]

  const allActivities = categories.flatMap(cat => cat.activities)
  const filteredActivities = allActivities.filter(activity => 
    activity.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Check if user can upload (3 minute cooldown)
  const canUpload = () => {
    if (!lastUploadTime) return true
    const now = new Date()
    const timeDiff = now.getTime() - lastUploadTime.getTime()
    return timeDiff >= 3 * 60 * 1000 // 3 minutes
  }

  const getTimeUntilNextUpload = () => {
    if (!lastUploadTime) return 0
    const now = new Date()
    const timeDiff = now.getTime() - lastUploadTime.getTime()
    const remaining = 3 * 60 * 1000 - timeDiff
    return Math.max(0, Math.ceil(remaining / 1000))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setShowActivities(true)
    }
  }

  const handleActivitySelect = (activity: any) => {
    setSelectedActivity(activity)
    setShowLocationModal(true)
  }

  const handleLocationConfirm = () => {
    setShowLocationModal(false)
    setShowPointsModal(true)
  }

  const handleShare = () => {
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: 'GreenActify',
        text: `Saya baru saja menyelesaikan aktivitas ${selectedActivity?.name} dan mendapat ${selectedActivity?.points} poin!`,
        url: window.location.href
      })
    }
  }

  if (!canUpload()) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Clock className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">Tunggu Sebentar</h2>
        <p className="text-gray-500 text-center mb-4">
          Anda dapat upload aktivitas lagi dalam {Math.floor(getTimeUntilNextUpload() / 60)} menit {getTimeUntilNextUpload() % 60} detik
        </p>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-1000"
            style={{ width: `${((3 * 60) - getTimeUntilNextUpload()) / (3 * 60) * 100}%` }}
          />
        </div>
      </div>
    )
  }

  // Points Success Modal
  if (showPointsModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Selamat!</h2>
          <p className="text-gray-600 mb-4">
            Anda mendapat <span className="font-bold text-green-600">+{selectedActivity?.points} poin</span> 
            {' '}dari aktivitas {selectedActivity?.name}
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleShare}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Bagikan
            </button>
            <button 
              onClick={() => {
                setShowPointsModal(false)
                setSelectedFile(null)
                setSelectedActivity(null)
                setLastUploadTime(new Date())
              }}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Location Confirmation Modal
  if (showLocationModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Konfirmasi Lokasi</h2>
          <div className="h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">
            Aktivitas: <span className="font-semibold">{selectedActivity?.name}</span>
          </p>
          <p className="text-gray-600 mb-6">
            Lokasi terdeteksi: Jakarta Selatan
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleLocationConfirm}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Konfirmasi Lokasi
            </button>
            <button 
              onClick={() => setShowLocationModal(false)}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Ubah Lokasi
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Activity Selection View
  if (showActivities && selectedFile) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Pilih Aktivitas</h1>
          <button 
            onClick={() => setShowActivities(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari aktivitas..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActivities.map((activity) => (
            <div 
              key={activity.id}
              className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleActivitySelect(activity)}
            >
              <div className="w-full h-32 bg-gray-200 rounded-lg mb-3">
                {/* Activity image placeholder */}
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-lg"></div>
              </div>
              <h3 className="font-semibold text-lg mb-1">{activity.name}</h3>
              <p className="text-green-600 font-bold">+{activity.points} poin</p>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id}>
              <h2 className="text-xl font-bold mb-4">{category.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {category.activities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleActivitySelect(activity)}
                  >
                    <div className="w-full h-24 bg-gray-200 rounded-lg mb-3">
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-lg"></div>
                    </div>
                    <h3 className="font-semibold mb-1">{activity.name}</h3>
                    <p className="text-green-600 font-bold text-sm">+{activity.points} poin</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Main Upload View
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Upload Aktivitas</h1>
        <p>Dokumentasikan aksi hijau Anda hari ini</p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-green-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Upload Foto Aktivitas</h3>
            <p className="text-gray-600 mb-4">
              Klik untuk memilih foto atau drag & drop di sini
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Upload className="w-5 h-5 mr-2" />
              Pilih Foto
            </div>
          </label>
        </div>
      </div>

      {/* Quick Activity Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Kategori Aktivitas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div 
              key={category.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <h3 className="font-bold text-lg mb-2">{category.name}</h3>
              <p className="text-gray-600 text-sm mb-3">
                {category.activities.length} aktivitas tersedia
              </p>
              <div className="flex -space-x-2">
                {category.activities.slice(0, 3).map((_, index) => (
                  <div 
                    key={index}
                    className="w-8 h-8 bg-green-400 rounded-full border-2 border-white"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AksiPage