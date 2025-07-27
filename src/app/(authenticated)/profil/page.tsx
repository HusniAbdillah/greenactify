'use client'

import React, { useState } from 'react'
import { Camera, Share2, Calendar, MapPin, Trophy, Award, Download, Edit } from 'lucide-react'

const ProfilPage = () => {
  const [activeTab, setActiveTab] = useState<'activities' | 'overview'>('activities')
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const userProfile = {
    name: 'Ahmad Green',
    username: '@ahmadgreen',
    avatar: '/images/avatar.jpg',
    points: 2450,
    rank: 12,
    location: 'Jakarta Selatan',
    joinDate: '2024-01-15',
    totalActivities: 45,
    co2Saved: 125.5 // kg
  }

  const recentActivities = [
    {
      id: 1,
      type: 'Tanam Pohon',
      points: 50,
      date: '2025-01-22',
      location: 'Taman Suropati',
      image: '/images/plant1.jpg'
    },
    {
      id: 2,
      type: 'Daur Ulang Plastik',
      points: 20,
      date: '2025-01-21',
      location: 'Rumah',
      image: '/images/recycle1.jpg'
    },
    {
      id: 3,
      type: 'Bersepeda ke Kantor',
      points: 30,
      date: '2025-01-20',
      location: 'Jakarta Pusat',
      image: '/images/bike1.jpg'
    },
    {
      id: 4,
      type: 'Bersih-bersih Pantai',
      points: 40,
      date: '2025-01-19',
      location: 'Pantai Ancol',
      image: '/images/beach1.jpg'
    },
    {
      id: 5,
      type: 'Kompos Organik',
      points: 25,
      date: '2025-01-18',
      location: 'Rumah',
      image: '/images/compost1.jpg'
    },
    {
      id: 6,
      type: 'Hemat Energi',
      points: 15,
      date: '2025-01-17',
      location: 'Kantor',
      image: '/images/energy1.jpg'
    },
    {
      id: 7,
      type: 'Tanam Sayuran',
      points: 35,
      date: '2025-01-16',
      location: 'Kebun Rumah',
      image: '/images/vegetable1.jpg'
    },
    {
      id: 8,
      type: 'Car Free Day',
      points: 25,
      date: '2025-01-15',
      location: 'Bundaran HI',
      image: '/images/carfree1.jpg'
    },
    {
      id: 9,
      type: 'Daur Ulang Kertas',
      points: 15,
      date: '2025-01-14',
      location: 'Sekolah',
      image: '/images/paper1.jpg'
    },
    {
      id: 10,
      type: 'Bersih-bersih Sungai',
      points: 45,
      date: '2025-01-13',
      location: 'Kali Besar',
      image: '/images/river1.jpg'
    }
  ]

  const achievements = [
    { title: 'Tree Planter', description: 'Menanam 10 pohon', icon: '🌳', achieved: true },
    { title: 'Eco Warrior', description: '1000 poin tercapai', icon: '⚔️', achieved: true },
    { title: 'Recycling Hero', description: '50 aktivitas daur ulang', icon: '♻️', achieved: false },
    { title: 'Green Commuter', description: '30 hari transportasi hijau', icon: '🚲', achieved: true },
  ]

  const handleImageSelect = (image: string) => {
    setSelectedImages(prev => {
      if (prev.includes(image)) {
        return prev.filter(img => img !== image)
      } else {
        return [...prev, image]
      }
    })
  }

  const handleShareProfile = () => {
    const selectedActivities = recentActivities.filter(activity => 
      selectedImages.includes(activity.image)
    )
    
    if (selectedActivities.length === 0) {
      alert('Pilih setidaknya satu foto untuk dibagikan!')
      return
    }

    const shareText = `Saya telah menyelesaikan ${selectedActivities.length} aktivitas hijau dan meraih ${selectedActivities.reduce((sum, act) => sum + act.points, 0)} poin di GreenActify! 🌱`
    
    if (navigator.share) {
      navigator.share({
        title: 'GreenActify Profile',
        text: shareText,
        url: window.location.href
      })
    } else {
      // Fallback untuk browser yang tidak support Web Share API
      navigator.clipboard.writeText(shareText + ' ' + window.location.href)
      alert('Link profil telah disalin!')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Profile Header - Sticky */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6 sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600"></div>
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-2xl font-bold">{userProfile.name}</h1>
              <button className="p-1 hover:bg-white hover:bg-opacity-20 rounded">
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <p className="opacity-90 mb-1">{userProfile.username}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {userProfile.location}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Bergabung {new Date(userProfile.joinDate).toLocaleDateString('id-ID')}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold">{userProfile.points.toLocaleString()}</div>
            <div className="text-sm opacity-90">Poin Total</div>
            <div className="text-sm opacity-75">Peringkat #{userProfile.rank}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{userProfile.totalActivities}</div>
          <div className="text-sm text-gray-600">Aktivitas</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{userProfile.rank}</div>
          <div className="text-sm text-gray-600">Peringkat</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl mb-2">🌱</div>
          <div className="text-2xl font-bold text-gray-800">{userProfile.co2Saved}</div>
          <div className="text-sm text-gray-600">kg CO₂ Diselamatkan</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-gray-800">{achievements.filter(a => a.achieved).length}</div>
          <div className="text-sm text-gray-600">Pencapaian</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          className={`flex-1 py-3 px-4 rounded-md font-semibold transition-colors ${
            activeTab === 'activities'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('activities')}
        >
          Aktivitas Terbaru
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-md font-semibold transition-colors ${
            activeTab === 'overview'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
      </div>

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          {/* Share Section */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Bagikan Aktivitas</h2>
              <div className="space-x-2">
                <button
                  onClick={handleShareProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  disabled={selectedImages.length === 0}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Bagikan ({selectedImages.length})
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Pilih foto aktivitas yang ingin dibagikan dengan mengetap gambar
            </p>
          </div>

          {/* Activities History */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-bold mb-4">Riwayat Aktivitas (10 Terakhir)</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div 
                      className={`w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedImages.includes(activity.image) 
                          ? 'border-green-500 ring-2 ring-green-200' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                      onClick={() => handleImageSelect(activity.image)}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                        {selectedImages.includes(activity.image) && '✓'}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{activity.type}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(activity.date).toLocaleDateString('id-ID')}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {activity.location}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">+{activity.points}</div>
                      <div className="text-sm text-gray-600">poin</div>
                    </div>
                    
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Achievements */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Pencapaian</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    achievement.achieved 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className={`font-bold ${achievement.achieved ? 'text-green-800' : 'text-gray-600'}`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm ${achievement.achieved ? 'text-green-600' : 'text-gray-500'}`}>
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.achieved && (
                      <div className="text-green-500">
                        <Award className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Statistics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Statistik Bulan Ini</h2>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Unduh Laporan
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-blue-800">Aktivitas</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">340</div>
                <div className="text-sm text-green-800">Poin Earned</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">25.5</div>
                <div className="text-sm text-yellow-800">kg CO₂ Saved</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">8</div>
                <div className="text-sm text-purple-800">Hari Aktif</div>
              </div>
            </div>
          </div>

          {/* Impact Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Dampak Lingkungan</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🌳</div>
                  <div>
                    <div className="font-semibold">Setara dengan menanam</div>
                    <div className="text-sm text-gray-600">15 pohon dewasa</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">15</div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">💧</div>
                  <div>
                    <div className="font-semibold">Air yang dihemat</div>
                    <div className="text-sm text-gray-600">500 liter</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">500L</div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">⚡</div>
                  <div>
                    <div className="font-semibold">Energi yang dihemat</div>
                    <div className="text-sm text-gray-600">75 kWh</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-600">75kWh</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom padding */}
      <div className="md:hidden h-20"></div>
    </div>
  )
}

export default ProfilPage