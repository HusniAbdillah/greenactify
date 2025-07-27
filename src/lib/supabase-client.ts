import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('🔧 Initializing Supabase client:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyPreview: supabaseAnonKey?.substring(0, 20) + '...'
})

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Disable auth for debugging
  }
})

// Test function
export const testSupabaseConnection = async () => {
  try {
    console.log('🧪 Testing Supabase connection...')
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    console.log('Connection test result:', { data, error, count })
    return !error
  } catch (err) {
    console.error('Connection test failed:', err)
    return false
  }
}

// Types (keep existing types)
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
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export type LeaderboardUser = {
  id: string
  full_name: string
  avatar_url?: string
  points: number
  rank: number
}

export type LeaderboardProvince = {
  province: string
  total_points: number
  user_count: number
  rank: number
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
  points: number
  date: string
}

export interface UserChallenge {
  id: string
  user_id: string
  challenge_id: string
  progress: number
  completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

// Client-side functions (tanpa server auth)
export const getProfileByUserId = async (userId: string): Promise<Profile | null> => {
  console.log('🔍 Fetching profile for userId:', userId)
  
  if (!userId) {
    console.warn('❌ No userId provided')
    return null
  }

  try {
    const { data, error, status, statusText } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    console.log('📊 Profile query result:', { 
      data, 
      error, 
      status, 
      statusText,
      hasData: !!data,
      errorType: typeof error,
      errorKeys: error ? Object.keys(error) : []
    })

    if (error) {
      console.error('❌ Profile query detailed error:', {
        message: error.message || 'No message',
        details: error.details || 'No details',
        hint: error.hint || 'No hint',
        code: error.code || 'No code',
        status: status || 'No status'
      })
      return null
    }

    console.log('✅ Profile fetch successful:', data)
    return data
  } catch (err) {
    console.error('❌ Profile query exception:', err)
    return null
  }
}

export const getActivitiesByUserId = async (userId: string): Promise<Activity[]> => {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching activities:', error)
    return []
  }
  return data
}

export const getLeaderboardUsers = async (limit: number = 10): Promise<LeaderboardUser[]> => {
  console.log('Fetching leaderboard users with limit:', limit)
  
  const { data, error } = await supabase
    .from('leaderboard_users')
    .select('*')
    .limit(limit)

  if (error) {
    console.error('Error fetching leaderboard users:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return []
  }

  console.log('Leaderboard users data:', data)
  return data || []
}

export const getLeaderboardProvinces = async (limit: number = 10): Promise<LeaderboardProvince[]> => {
  console.log('Fetching leaderboard provinces with limit:', limit)
  
  const { data, error } = await supabase
    .from('leaderboard_provinces')
    .select('*')
    .limit(limit)

  if (error) {
    console.error('Error fetching leaderboard provinces:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return []
  }

  console.log('Leaderboard provinces data:', data)
  return data || []
}

export const getActivityCategories = async (): Promise<ActivityCategory[]> => {
  const { data, error } = await supabase
    .from('activity_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) {
    console.error('Error fetching activity categories:', error)
    return []
  }
  return data
}

export const getTodayChallenge = async (): Promise<DailyChallenge | null> => {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('date', today)
    .single()

  if (error) {
    console.error('Error fetching today challenge:', error)
    return null
  }
  return data
}

export const getUserChallengeProgress = async (userId: string, challengeId: string) => {
  const { data, error } = await supabase
    .from('user_challenges')
    .select('*')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .single()

  if (error) {
    console.error('Error fetching user challenge progress:', error)
    return null
  }
  return data
}