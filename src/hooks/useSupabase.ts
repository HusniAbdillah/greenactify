'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState, useCallback } from 'react'
import {
  Profile,
  Activity,
  LeaderboardUser,
  LeaderboardProvince,
  ActivityCategory,
  DailyChallenge,
  UserChallenge,
} from '@/lib/types/supabase'
import {
  getProfileByUserId,
  getActivitiesByUserId,
  getLeaderboardUsers,
  getLeaderboardProvinces,
  getActivityCategories,
  getTodayChallenge,
  getUserChallengeProgress,
  testSupabaseConnection
} from '@/lib/supabase-client'

export const useProfile = () => {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!isLoaded) return
    
    if (!user?.id) {
      console.log('❌ No user ID available')
      setLoading(false)
      setError('No user ID available')
      return
    }

    try {
      console.log('🔍 Fetching profile for user:', user.id)
      const data = await getProfileByUserId(user.id)
      setProfile(data)
      setError(null)
      console.log('✅ Profile fetched:', data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Profile fetch error:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [user?.id, isLoaded])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile]) // ✅ Fix: Include fetchProfile in dependency

  return { profile, loading, error, refetch: fetchProfile }
}

export const useLeaderboard = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [provinces, setProvinces] = useState<LeaderboardProvince[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        console.log('🏆 Fetching leaderboard data...')
        
        // Test connection first
        const isConnected = await testSupabaseConnection()
        if (!isConnected) {
          throw new Error('Supabase connection failed')
        }

        const [usersData, provincesData] = await Promise.all([
          getLeaderboardUsers(10),
          getLeaderboardProvinces(10)
        ])

        console.log('📊 Leaderboard data:', { usersData, provincesData })
        setUsers(usersData)
        setProvinces(provincesData)
        setError(null)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error('❌ Leaderboard fetch error:', errorMsg)
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  return { users, provinces, loading, error }
}

export const useActivityCategories = () => {
  const [categories, setCategories] = useState<ActivityCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('📂 Fetching categories...')
        const data = await getActivityCategories()
        console.log('📂 Categories data:', data)
        setCategories(data)
        setError(null)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error('❌ Categories fetch error:', errorMsg)
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}

export const useUserActivities = () => {
  const { user, isLoaded } = useUser()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      if (!isLoaded || !user?.id) {
        setLoading(false)
        return
      }

      const data = await getActivitiesByUserId(user.id)
      setActivities(data)
      setLoading(false)
    }

    if (isLoaded) {
      fetchActivities()
    }
  }, [user?.id, isLoaded])

  return { activities, loading }
}

export const useDailyChallenge = () => {
  const { user, isLoaded } = useUser()
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null)
  const [progress, setProgress] = useState<UserChallenge | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChallenge = async () => {
      const challengeData = await getTodayChallenge()
      setChallenge(challengeData)

      if (challengeData && isLoaded && user?.id) {
        const progressData = await getUserChallengeProgress(user.id, challengeData.id)
        setProgress(progressData)
      }

      setLoading(false)
    }

    fetchChallenge()
  }, [user?.id, isLoaded])

  return { challenge, progress, loading }
}