import { createClient } from '@supabase/supabase-js'
import {
  Profile,
  Activity,
  ActivityCategory,
  DailyChallenge,
  UserChallenge,
  LeaderboardUser,
  LeaderboardProvince,
  ActivityFeed,
  UploadCooldown,
  Notification,
  RealtimePayload,
  ActivityCategoryGroup,
  ActivityGroup,
  ProvinceStats,
  ChatbotConversation,
  UserFollow,
  ActivityLike
} from '@/lib/types/supabase'


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

export const getDetailedActivitiesByUserId = async (userId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      id,
      user_id,
      category_id,
      title,
      description,
      image_url,
      location_name,
      latitude,
      longitude,
      province,
      city,
      status,
      verified_by,
      verified_at,
      is_shared,
      share_count,
      like_count,
      metadata,
      created_at,
      updated_at,
      points,
      activity_categories (
        name,
        base_points,
        group_category
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching detailed activities:', error)
    return []
  }
  return data
}

export const recalculateAllUserPoints = async () => {
  // 1. Ambil semua aktivitas yang disetujui
  const { data: activities, error } = await supabase
    .from('activities')
    .select('user_id, points')
    .eq('status', 'approved');

  if (error) {
    console.error('❌ Error fetching activities:', error);
    return { success: false, error };
  }

  // 2. Hitung total poin per user
  const pointMap: Record<string, number> = {};
  for (const { user_id, points } of activities) {
    pointMap[user_id] = (pointMap[user_id] || 0) + points;
  }

  // 3. Update ke `profiles` dan `leaderboard_users`
  const updates = Object.entries(pointMap).map(async ([userId, totalPoints]) => {
    // Update ke `profiles`
    const profileUpdate = supabase
      .from('profiles')
      .update({ points: totalPoints })
      .eq('id', userId);

    // Upsert ke `leaderboard_users`
    const leaderboardUpdate = supabase
      .from('leaderboard_users')
      .upsert({ user_id: userId, points: totalPoints }, { onConflict: 'user_id' });

    return Promise.all([profileUpdate, leaderboardUpdate]);
  });

  const results = await Promise.allSettled(updates);
  const updated = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { success: true, updated, failed };
};


