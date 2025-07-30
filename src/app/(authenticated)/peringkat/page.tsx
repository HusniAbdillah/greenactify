'use client'

import React, { useState } from 'react'
import { Search, Users, MapPin, Trophy, Medal, Award } from 'lucide-react'

const PeringkatPage = () => {
  const [usersData, setUsersData] = useState<any[]>([])
  const [provincesData, setProvincesData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'users' | 'provinces'>('users')
  const [searchQuery, setSearchQuery] = useState('')

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [usersResponse, provincesResponse] = await Promise.all([
          fetch('/api/leaderboard?type=users'),
          fetch('/api/leaderboard?type=provinces')
        ])

        if (!usersResponse.ok || !provincesResponse.ok) {
          throw new Error('Failed to fetch leaderboard data')
        }

        const [usersData, provincesData] = await Promise.all([
          usersResponse.json(),
          provincesResponse.json()
        ])

        setUsersData(usersData.data || [])
        setProvincesData(provincesData.data || [])
      } catch (error) {
        console.error('Failed to fetch leaderboard data:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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

  const formatPoints = (points: number) => {
    if (points >= 1000000) {
      return (points / 1000000).toFixed(points % 1000000 === 0 ? 0 : 1) + 'M'
    } else if (points >= 1000) {
      return (points / 1000).toFixed(points % 1000 === 0 ? 0 : 1) + 'k'
    } else {
      return points.toString()
    }
  }

  const getFilteredUsers = () => {
    const sortedUsers = usersData.sort((a, b) => (a.rank || 999) - (b.rank || 999))

    if (searchQuery.trim()) {
      return sortedUsers.filter(user =>
        (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.province || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else {
      return sortedUsers.slice(0, 10)
    }
  }

  const getFilteredProvinces = () => {
    const sortedProvinces = provincesData.sort((a, b) => (a.rank || 999) - (b.rank || 999))

    if (searchQuery.trim()) {
      return sortedProvinces.filter(province =>
        (province.province || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else {
      return sortedProvinces.slice(0, 10)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-tealLight from-green-500 to-blue-500 text-white rounded-lg p-6">
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
      <div className="flex bg-mintPastel border-greenDark border-2 rounded-full p-1 ">
        <button
          className={`flex-1 py-3 px-4 rounded-full font-semibold transition-colors ${
            activeTab === 'users'
              ? 'bg-greenDark text-whiteMint shadow-sm'
              : 'text-greenDark hover:text-tealLight active:text-tealLight'
          }`}
          onClick={() => setActiveTab('users')}
        >
          <Users className="w-5 h-5 inline mr-2" />
          Pengguna
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-full font-semibold transition-colors ${
            activeTab === 'provinces'
              ? 'bg-greenDark text-whiteMint shadow-sm'
              : 'text-greenDark hover:text-tealLight active:text-tealLight'
          }`}
          onClick={() => setActiveTab('provinces')}
        >
          <MapPin className="w-5 h-5 inline mr-2" />
          Provinsi
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={activeTab === 'users' ? 'Cari penggguna...' : 'Cari provinsi...'}
          className="block w-full pl-10 pr-3 py-4 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-tealLight sm:text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
          ) : getFilteredUsers().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found matching "{searchQuery}".
            </div>
          ) : (
            getFilteredUsers().map((user, index) => (
              <div
                key={user.id || user.full_name || user.clerk_id || index}
                className="bg-greenDark rounded-2xl p-3 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => {/* Navigate to user profile */}}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(user.rank)}
                  </div>

                  <div className="hidden sm:block w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
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
                    <h3 className="font-bold text-lg text-whiteMint">{user.full_name || 'Unknown User'}</h3>
                    <p className="text-sm text-mintPastel italic">{user.province || 'Unknown Province'}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-center text-2xl font-bold text-yellowGold">
                      {formatPoints(user.points || 0)}
                    </div>
                    <div className="text-center text-sm text-whiteMint">poin</div>
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
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading provinces...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Failed to load provinces. Please try again.
            </div>
          ) : provincesData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No provinces found.
            </div>
          ) : getFilteredProvinces().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No provinces found matching "{searchQuery}".
            </div>
          ) : (
            getFilteredProvinces().map((province: any, index: number) => (
              <div
                key={province.id || province.province || index}
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
                    <h3 className="font-bold text-lg">{province.province}</h3>
                    <p className="text-gray-600">{province.total_users} peserta</p>
                    <p className="text-sm text-gray-500">{province.total_activities} aktivitas</p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{formatPoints(province.total_points || 0)}</div>
                    <div className="text-sm text-gray-600">Poin</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default PeringkatPage
