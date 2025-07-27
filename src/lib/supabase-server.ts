import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'
import { supabase } from './supabase-client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createServerSupabaseClient = async () => {
  const { getToken } = await auth()
  const token = await getToken({ template: 'supabase' })
  
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        headers: token 
          ? { Authorization: `Bearer ${token}` }
          : {},
      },
    }
  )
}

// ========================================
// DATABASE TYPES (Enhanced)
// ========================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      activities: {
        Row: Activity
        Insert: Omit<Activity, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Activity, 'id' | 'created_at'>>
      }
      activity_categories: {
        Row: ActivityCategory
        Insert: Omit<ActivityCategory, 'id' | 'created_at'>
        Update: Partial<Omit<ActivityCategory, 'id' | 'created_at'>>
      }
      daily_challenges: {
        Row: DailyChallenge
        Insert: Omit<DailyChallenge, 'id' | 'created_at'>
        Update: Partial<Omit<DailyChallenge, 'id' | 'created_at'>>
      }
      user_challenges: {
        Row: UserChallenge
        Insert: Omit<UserChallenge, 'id' | 'created_at'>
        Update: Partial<Omit<UserChallenge, 'id' | 'created_at'>>
      }
    }
    Views: {
      leaderboard_users: {
        Row: LeaderboardUser
      }
      leaderboard_provinces: {
        Row: LeaderboardProvince
      }
      activities_feed: {
        Row: ActivityFeed
      }
    }
  }
}

// ========================================
// TYPE DEFINITIONS
// ========================================

export type Profile = {
  id: string
  email: string
  full_name?: string
  username?: string
  avatar_url?: string
  points: number
  level: number
  province?: string
  city?: string
  bio?: string
  onboarding_completed: boolean
  last_activity_upload?: string
  total_activities: number
  created_at: string
  updated_at: string
}

export type Activity = {
  id: string
  user_id: string
  category_id: string
  title: string
  description?: string
  points: number
  image_url?: string
  location_name?: string
  latitude?: number
  longitude?: number
  province?: string
  city?: string
  status: 'pending' | 'approved' | 'rejected'
  verified_by?: string
  verified_at?: string
  is_shared: boolean
  share_count: number
  like_count: number
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type ActivityCategory = {
  id: string
  name: string
  description?: string
  icon?: string
  base_points: number
  color: string
  image_url?: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export type DailyChallenge = {
  id: string
  title: string
  description: string
  instructions?: string
  points: number
  date: string
  category_id?: string
  difficulty: 'easy' | 'medium' | 'hard'
  target_count: number
  icon?: string
  image_url?: string
  is_active: boolean
  created_at: string
}

export type UserChallenge = {
  id: string
  user_id: string
  challenge_id: string
  completed: boolean
  progress: number
  completed_at?: string
  activity_id?: string
  created_at: string
}

export type LeaderboardUser = {
  id: string
  full_name?: string
  username?: string
  avatar_url?: string
  points: number
  province?: string
  level: number
  total_activities: number
  active_days: number
  completed_challenges: number
  avg_activity_points: number
  last_activity?: string
  rank: number
  province_rank: number
}

export type LeaderboardProvince = {
  province: string
  total_users: number
  total_activities: number
  total_points: number
  avg_user_points: number
  active_days: number
  last_activity?: string
  rank: number
}

export type ActivityFeed = {
  id: string
  title: string
  description?: string
  points: number
  image_url?: string
  location_name?: string
  province?: string
  like_count: number
  share_count: number
  created_at: string
  user_name?: string
  username?: string
  user_avatar?: string
  category_name: string
  category_icon?: string
  category_color: string
}

export type UploadCooldown = {
  id: string
  user_id: string
  last_upload: string
  cooldown_expires: string
}

export type ChatbotConversation = {
  id: string
  user_id: string
  message: string
  response?: string
  message_type: 'user' | 'bot'
  created_at: string
}

export type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'achievement'
  is_read: boolean
  action_url?: string
  metadata?: Record<string, unknown> // ✅ Ganti any dengan unknown
  created_at: string
}

// ========================================
// HELPER FUNCTIONS
// ========================================

export const getProfileByUserId = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

export const getActivitiesByUserId = async (userId: string): Promise<Activity[]> => {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      activity_categories (
        name,
        icon,
        color
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching activities:', error)
    return []
  }

  return data || []
}

export const getLeaderboardUsers = async (limit: number = 10): Promise<LeaderboardUser[]> => {
  const { data, error } = await supabase
    .from('leaderboard_users')
    .select('*')
    .limit(limit)

  if (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }

  return data || []
}

export const getLeaderboardProvinces = async (limit: number = 10): Promise<LeaderboardProvince[]> => {
  const { data, error } = await supabase
    .from('leaderboard_provinces')
    .select('*')
    .limit(limit)

  if (error) {
    console.error('Error fetching province leaderboard:', error)
    return []
  }

  return data || []
}

export const getActivityCategories = async (): Promise<ActivityCategory[]> => {
  const { data, error } = await supabase
    .from('activity_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

export const getTodayChallenge = async (): Promise<DailyChallenge | null> => {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

  const { data, error } = await supabase
    .from('daily_challenges')
    .select(`
      *,
      activity_categories (
        name,
        icon,
        color
      )
    `)
    .eq('date', today)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching today challenge:', error)
    return null
  }

  return data
}

export const getUserChallengeProgress = async (userId: string, challengeId: string): Promise<UserChallenge | null> => {
  const { data, error } = await supabase
    .from('user_challenges')
    .select('*')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching challenge progress:', error)
    return null
  }

  return data
}

export const checkUploadCooldown = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('upload_cooldowns')
    .select('cooldown_expires')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking cooldown:', error)
    return false
  }

  if (!data) return true // No cooldown record, user can upload

  const now = new Date()
  const cooldownExpires = new Date(data.cooldown_expires)
  
  return now > cooldownExpires // Can upload if cooldown expired
}

export const setUploadCooldown = async (userId: string): Promise<void> => {
  const now = new Date()
  const cooldownExpires = new Date(now.getTime() + 3 * 60 * 1000) // 3 minutes

  const { error } = await supabase
    .from('upload_cooldowns')
    .upsert({
      user_id: userId,
      last_upload: now.toISOString(),
      cooldown_expires: cooldownExpires.toISOString()
    })

  if (error) {
    console.error('Error setting cooldown:', error)
  }
}

export const createActivity = async (activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>): Promise<Activity | null> => {
  // Check cooldown first
  const canUpload = await checkUploadCooldown(activity.user_id)
  if (!canUpload) {
    throw new Error('Masih dalam cooldown. Tunggu 3 menit setelah upload terakhir.')
  }

  const { data, error } = await supabase
    .from('activities')
    .insert(activity)
    .select()
    .single()

  if (error) {
    console.error('Error creating activity:', error)
    return null
  }

  // Set cooldown
  await setUploadCooldown(activity.user_id)

  return data
}

export const getActivitiesFeed = async (limit: number = 20, offset: number = 0): Promise<ActivityFeed[]> => {
  const { data, error } = await supabase
    .from('activities_feed')
    .select('*')
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching activities feed:', error)
    return []
  }

  return data || []
}

// Real-time subscriptions
export const subscribeToActivities = (callback: (payload: RealtimePayload) => void) => {
  return supabase
    .channel('activities')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'activities' 
    }, callback)
    .subscribe()
}

export const subscribeToLeaderboard = (callback: (payload: RealtimePayload) => void) => {
  return supabase
    .channel('profiles')
    .on('postgres_changes', { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'profiles' 
    }, callback)
    .subscribe()
}

// Tambahkan type untuk Realtime payload
export type RealtimePayload = {
  commit_timestamp: string
  errors: string[]
  eventType: string
  new: Record<string, unknown>
  old: Record<string, unknown>
  schema: string
  table: string
}