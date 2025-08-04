'use client'

import React, { useState, useEffect } from 'react'
import { Search, Users, MapPin, Trophy, Medal, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useUsers, useProvinceStats } from '@/hooks/useSWRData' 

interface User {
  id?: string;
  clerk_id?: string;
  rank?: number;
  username?: string;
  full_name?: string;
  name?: string;
  province?: string;
  points?: number;
  avatar_url?: string;
}

interface Province {
  id?: string;
  rank?: number;
  name?: string;
  province?: string;
  total_users?: number;
  total_activities?: number;
  total_points?: number;
}

const PeringkatPage = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'provinces'>('users')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()

  const { data: usersResponse, isLoading: usersLoading, error: usersError } = useUsers()
  const { data: provincesResponse, isLoading: provincesLoading, error: provincesError } = useProvinceStats()

  const usersData = usersResponse?.data || []
  const provincesData = provincesResponse?.data || []

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/')
    }
  }, [isLoaded, isSignedIn, router])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-whiteMint" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />
      default:
        return <span className="w-6 h-6 bg-whiteMint rounded-full flex items-center justify-center text-sm font-bold">{rank}</span>
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


  const getFilteredUsers = (): User[] => {
    const sortedUsers = usersData.sort((a: User, b: User) => 
      (a.rank || 999) - (b.rank || 999)
    );

    if (searchQuery.trim()) {
      return sortedUsers.filter((user: User) =>
        (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      return sortedUsers.slice(0, 10);
    }
  }

  const getFilteredProvinces = (): Province[] => {
    const sortedProvinces = provincesData.sort((a: Province, b: Province) => 
      (a.rank || 999) - (b.rank || 999)
    );

    if (searchQuery.trim()) {
      return sortedProvinces.filter((province: Province) =>
        (province.province || province.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else {
      return sortedProvinces.slice(0, 10)
    }
  }

  return (
    <div className="p-6 space-y-6">

      <div className="bg-tealLight from-green-500 to-blue-500 text-white rounded-lg p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-1 sm:mb-2">Papan Peringkat</h1>
        <p>Lihat pencapaian komunitas GreenActify</p>
      </div>

      {(usersError || provincesError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {usersError?.message || provincesError?.message}
        </div>
      )}

      <div className="flex bg-mintPastel border-greenDark border-2 rounded-full p-1 w-full md:w-fit md:mx-auto">
        <button
          className={`flex-1 md:flex-none py-3 px-4 md:py-2 md:px-4 md:text-sm rounded-full font-semibold transition-colors ${
            activeTab === 'users'
              ? 'bg-greenDark text-whiteMint shadow-sm'
              : 'text-greenDark hover:text-tealLight active:text-tealLight'
          }`}
          onClick={() => setActiveTab('users')}
        >
          <Users className="w-5 h-5 md:w-4 md:h-4 inline mr-2" />
          Pengguna
        </button>
        <button
          className={`flex-1 md:flex-none py-3 px-4 md:py-2 md:px-4 md:text-sm rounded-full font-semibold transition-colors ${
            activeTab === 'provinces'
              ? 'bg-greenDark text-whiteMint shadow-sm'
              : 'text-greenDark hover:text-tealLight active:text-tealLight'
          }`}
          onClick={() => setActiveTab('provinces')}
        >
          <MapPin className="w-5 h-5 md:w-4 md:h-4 inline mr-2" />
          Provinsi
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={activeTab === 'users' ? 'Cari pengguna...' : 'Cari provinsi...'}
          className="block w-full pl-10 pr-3 py-4 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-tealLight sm:text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>


      {activeTab === 'users' && (
        <div className="space-y-4">
          {usersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading dari cache...</p>
            </div>
          ) : usersError ? (
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
            getFilteredUsers().map((user: User, index: number) => ( // 🔧 Fix: Tambahkan tipe eksplisit
              <div
                key={user.id || user.full_name || user.clerk_id || index}
                className={`${user.rank === 1 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-greenDark'} rounded-2xl p-3 hover:shadow-xl transition-shadow cursor-pointer`}
                onClick={() => router.push(`/peringkat/pengguna/${user.id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(user.rank || 0)}
                  </div>

                  <div className="hidden sm:block w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name || user.username || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-whiteMint">
                      {user.username || user.name || 'Unknown User'}
                    </h3>
                    <p className={`${user.rank === 1 ? 'text-greenDark' : 'text-mintPastel'} text-sm italic`}>
                      {user.full_name || 'Unknown Name'}
                    </p>
                    <p className={`${user.rank === 1 ? 'text-greenDark' : 'text-mintPastel'} text-sm`}>
                      {user.province || 'Unknown Province'}
                    </p>
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

      {activeTab === 'provinces' && (
        <div className="space-y-4">
          {provincesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading provinsi dari cache...</p>
            </div>
          ) : provincesError ? (
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
                className={`${province.rank === 1 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-greenDark'} rounded-2xl p-3 hover:shadow-xl transition-shadow cursor-pointer`}
                onClick={() => {/* Navigate ke province details */}}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(province.rank)}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-whiteMint">{province.province}</h3>
                    <p className={`${province.rank === 1 ? 'text-greenDark' : 'text-mintPastel'} text-sm italic`}>{formatPoints(province.total_users || 0)} peserta • {formatPoints(province.total_activities || 0)} aktivitas</p>
                  </div>

                  <div className="text-right">
                    <div className="text-center text-2xl font-bold text-yellowGold">
                      {formatPoints(province.total_points || 0)}
                    </div>
                    <div className="text-center text-sm text-whiteMint">poin</div>
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
