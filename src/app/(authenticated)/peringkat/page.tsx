'use client'

import React, { useState } from 'react'
import { Search, Users, MapPin, Trophy, Medal, Award } from 'lucide-react'

const PeringkatPage = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'provinces'>('users')
  const [searchTerm, setSearchTerm] = useState('')

  const topUsers = [
    { 
      id: 1, 
      name: 'Ahmad Green', 
      username: '@ahmadgreen',
      points: 2450, 
      rank: 1,
      avatar: '/images/avatar1.jpg',
      activities: 45,
      province: 'DKI Jakarta'
    },
    { 
      id: 2, 
      name: 'Sari Eco', 
      username: '@sariego',
      points: 2100, 
      rank: 2,
      avatar: '/images/avatar2.jpg',
      activities: 38,
      province: 'Jawa Barat'
    },
    { 
      id: 3, 
      name: 'Budi Earth', 
      username: '@budiearth',
      points: 1980, 
      rank: 3,
      avatar: '/images/avatar3.jpg',
      activities: 42,
      province: 'Jawa Timur'
    },
    // Add more users...
  ]

  const topProvinces = [
    { 
      id: 1, 
      name: 'DKI Jakarta', 
      points: 45420, 
      rank: 1,
      participants: 1250,
      activities: 3420
    },
    { 
      id: 2, 
      name: 'Jawa Barat', 
      points: 42350, 
      rank: 2,
      participants: 2100,
      activities: 4200
    },
    { 
      id: 3, 
      name: 'Jawa Timur', 
      points: 38200, 
      rank: 3,
      participants: 1800,
      activities: 3800
    },
    // Add more provinces...
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />
      default:
        return <span className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">{rank}</span>
    }
  }

  const filteredUsers = topUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredProvinces = topProvinces.filter(province => 
    province.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Papan Peringkat</h1>
        <p>Lihat pencapaian komunitas GreenActify</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Cari pengguna atau provinsi..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          className={`flex-1 py-3 px-4 rounded-md font-semibold transition-colors ${
            activeTab === 'users'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('users')}
        >
          <Users className="w-5 h-5 inline mr-2" />
          Pengguna
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-md font-semibold transition-colors ${
            activeTab === 'provinces'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('provinces')}
        >
          <MapPin className="w-5 h-5 inline mr-2" />
          Provinsi
        </button>
      </div>

      {/* Users Leaderboard */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div 
              key={user.id} 
              className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => {/* Navigate to user profile */}}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12">
                  {getRankIcon(user.rank)}
                </div>
                
                <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                  {/* User avatar placeholder */}
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600"></div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{user.name}</h3>
                  <p className="text-gray-600">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.province}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{user.points.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{user.activities} aktivitas</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Provinces Leaderboard */}
      {activeTab === 'provinces' && (
        <div className="space-y-4">
          {filteredProvinces.map((province) => (
            <div 
              key={province.id} 
              className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12">
                  {getRankIcon(province.rank)}
                </div>
                
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{province.name}</h3>
                  <p className="text-gray-600">{province.participants.toLocaleString()} peserta</p>
                  <p className="text-sm text-gray-500">{province.activities.toLocaleString()} aktivitas</p>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{province.points.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Poin</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PeringkatPage