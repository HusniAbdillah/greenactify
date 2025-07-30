'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, Trophy, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  full_name: string
  username?: string
  email: string
  avatar_url?: string
  points: number
  level: number
  province?: string
  city?: string
  bio?: string
  total_activities: number
  created_at: string
  rank?: number
}

const UserProfilePage = () => {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/users/${userId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch user profile')
        }

        const data = await response.json()
        setProfile(data.data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserProfile()
    }
  }, [userId])

  const formatPoints = (points: number) => {
    if (points >= 1000000) {
      return (points / 1000000).toFixed(points % 1000000 === 0 ? 0 : 1) + 'M'
    } else if (points >= 1000) {
      return (points / 1000).toFixed(points % 1000 === 0 ? 0 : 1) + 'k'
    } else {
      return points.toString()
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error || 'Profile not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Profil Pengguna</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center space-x-6">
          {/* Avatar */}
          <div className="w-20 h-20 bg-gray-300 rounded-full overflow-hidden">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600"></div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h2 className="text-xl font-bold">{profile.full_name}</h2>
            {profile.username && (
              <p className="text-gray-600">@{profile.username}</p>
            )}
            <div className="flex items-center space-x-2 text-gray-500 mt-1">
              <MapPin className="w-4 h-4" />
              <span>{profile.province || 'Unknown Province'}</span>
            </div>
          </div>

          {/* Rank Badge */}
          {profile.rank && (
            <div className="bg-yellowGold text-greenDark px-4 py-2 rounded-full font-bold">
              Peringkat #{profile.rank}
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-4 p-4 bg-mintPastel rounded-lg">
            <p className="text-greenDark">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl text-center">
          <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">{formatPoints(profile.points)}</div>
          <div className="text-sm text-blue-500">Poin</div>
        </div>

        <div className="bg-green-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-600">{profile.level}</div>
          <div className="text-sm text-green-500">Level</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-xl text-center">
          <Activity className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">{profile.total_activities}</div>
          <div className="text-sm text-purple-500">Aktivitas</div>
        </div>

        <div className="bg-orange-50 p-4 rounded-xl text-center">
          <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-600">
            {new Date(profile.created_at).getFullYear()}
          </div>
          <div className="text-sm text-orange-500">Bergabung</div>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage
