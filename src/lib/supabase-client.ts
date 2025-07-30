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
  const profileUpdate = await supabase
    .from('profiles')
    .update({ points: totalPoints })
    .eq('id', userId);
    
  console.log('📝 Updated profile:', userId, profileUpdate);

  const leaderboardUpdate = await supabase
    .from('leaderboard_users')
    .upsert({ user_id: userId, points: totalPoints }, { onConflict: 'user_id' });
  console.log('🏆 Upserted leaderboard:', userId, leaderboardUpdate);
  return [profileUpdate, leaderboardUpdate];


  });

  const results = await Promise.allSettled(updates);
  const updated = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { success: true, updated, failed };
};






export const refreshProvinceStats = async () => {
  // Ambil semua activity yang disetujui
  const { data: activities, error: activitiesError } = await supabase
    .from('activities')
    .select('user_id, points, province')
    .eq('status', 'approved');

  if (activitiesError) {
    console.error('❌ Error fetching activities:', activitiesError);
    return { success: false, error: activitiesError };
  }

  // Ambil semua user beserta provinsinya
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, province');

  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError);
    return { success: false, error: profilesError };
  }

  // Buat map user ke provinsi
  const userProvinceMap = Object.fromEntries(
    profiles.map(p => [p.id, p.province])
  );

  // Grouping data per provinsi
  const provinceMap: Record<string, { userIds: Set<string>, totalPoints: number, totalActivities: number }> = {};

  for (const activity of activities) {
    const userId = activity.user_id;
    const userProvince = userProvinceMap[userId];
    if (!userProvince) continue;

    if (!provinceMap[userProvince]) {
      provinceMap[userProvince] = {
        userIds: new Set(),
        totalPoints: 0,
        totalActivities: 0
      };
    }

    provinceMap[userProvince].userIds.add(userId);
    provinceMap[userProvince].totalPoints += activity.points;
    provinceMap[userProvince].totalActivities += 1;
  }

  const updates = Object.entries(provinceMap).map(async ([province, stats]) => {
    const { userIds, totalPoints, totalActivities } = stats;
    const totalUsers = userIds.size;
    const avgPoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;

    const update = await supabase.from('province_stats').upsert(
      {
        province,
        total_users: totalUsers,
        total_activities: totalActivities,
        total_points: totalPoints,
        avg_points_per_user: avgPoints,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'province' }
    );
    console.log('📍 Upsert result for province:', province, update);

    return update;
  });

  const results = await Promise.allSettled(updates);
  const updated = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { success: true, updated, failed };
};

export const recalculateProvinceRanks = async () => {
  const { data: provinces, error } = await supabase
    .from('province_stats')
    .select('*');

  if (error) {
    console.error('❌ Error fetching province_stats:', error);
    return { success: false, error };
  }

  // Urutkan: total_points DESC, province ASC
  const sorted = [...provinces].sort((a, b) => {
    if (b.total_points !== a.total_points) {
      return b.total_points - a.total_points;
    }
    return a.province.localeCompare(b.province);
  });

  // Buat array update
  const updates = sorted.map((province, index) => {
    return supabase
      .from('province_stats')
      .update({ rank: index + 1 })
      .eq('province', province.province);
  });

  const results = await Promise.allSettled(updates);
  const success = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.length - success;

  return { success: true, updated: success, failed };
};
