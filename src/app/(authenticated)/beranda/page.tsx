'use client'

import React, { useState } from 'react'
import { Trophy, Download, Calendar, MapPin, TrendingUp } from 'lucide-react'

const BerandaPage = () => {
  const [userPoints] = useState(1250)
  const [dailyChallenge] = useState({
    title: 'Kurangi Sampah Plastik',
    description: 'Upload foto aktivitas mengurangi penggunaan plastik',
    points: 50,
    progress: 0
  })

  const recentActivities = [
    { id: 1, type: 'Tanam Pohon', points: 50, date: '2025-01-20', image: '/images/plant.jpg' },
    { id: 2, type: 'Daur Ulang', points: 20, date: '2025-01-19', image: '/images/recycle.jpg' },
    { id: 3, type: 'Bersepeda', points: 30, date: '2025-01-18', image: '/images/bike.jpg' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Selamat Datang Kembali!</h1>
        <p>Mari lanjutkan aksi hijau hari ini</p>
      </div>

      {/* Points & Daily Challenge */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* User Points */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Total Poin Anda</h2>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-green-600">{userPoints.toLocaleString()}</div>
          <p className="text-gray-600">Peringkat #42 secara nasional</p>
        </div>

        {/* Daily Challenge */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Tantangan Hari Ini</h2>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="font-semibold mb-2">{dailyChallenge.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{dailyChallenge.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-green-600 font-semibold">+{dailyChallenge.points} pts</span>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Mulai
            </button>
          </div>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Aktivitas Terbaru</h2>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Unduh Dampak
          </button>
        </div>
        
        <div className="grid gap-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4">
                {/* Placeholder for activity image */}
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-lg"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{activity.type}</h3>
                <p className="text-gray-600 text-sm">{activity.date}</p>
              </div>
              <div className="text-green-600 font-bold">+{activity.points} pts</div>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Peta Aktivitas Indonesia</h2>
          <MapPin className="w-6 h-6 text-green-600" />
        </div>
        <div className="h-64 bg-gradient-to-r from-green-100 to-green-300 rounded-lg flex items-center justify-center">
          <p className="text-gray-600">Indonesia Heatmap</p>
        </div>
      </div>

      {/* Quick Actions - Mobile Bottom Nav will be added separately */}
      <div className="md:hidden grid grid-cols-4 gap-4 pb-20">
        {/* This ensures content doesn't get hidden behind mobile nav */}
      </div>
    </div>
  )
}

export default BerandaPage