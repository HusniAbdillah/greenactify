'use client'

import React, { useState } from 'react'
import { Search, Users, MapPin, Trophy, Medal, Award } from 'lucide-react'

const PeringkatPage = () => {
  const [usersData, setUsersData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'users' | 'provinces'>('users')

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/users')

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`)
        }

        const data = await response.json()
        setUsersData(data.users || [])
      } catch (error) {
        console.error('Failed to fetch users:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Papan Peringkat</h1>
        <p>Lihat pencapaian komunitas GreenActify</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

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
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading users...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Failed to load users. Please try again.
            </div>
          ) : usersData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found.
            </div>
          ) : (
            usersData.map((user, index) => (
              <div
                key={user.id || user.full_name || user.clerk_id || index}
                className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => {/* Navigate to user profile */}}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(user.rank)}
                  </div>

                  <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{user.full_name || 'Unknown User'}</h3>
                    <p className="text-sm text-gray-500">{user.province || 'Unknown Province'}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {user.points ? user.points.toLocaleString() : '0'}
                    </div>
                    <div className="text-sm text-gray-600">poin</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Provinces Leaderboard */}
      {activeTab === 'provinces' && (
        <div className="space-y-4">
          {topProvinces.map((province) => (
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
