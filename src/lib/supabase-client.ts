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
    console.warn(' No userId provided')
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
      console.error(' Profile query detailed error:', {
        message: error.message || 'No message',
        details: error.details || 'No details',
        hint: error.hint || 'No hint',
        code: error.code || 'No code',
        status: status || 'No status'
      })
      return null
    }

    console.log(' Profile fetch successful:', data)
    return data
  } catch (err) {
    console.error(' Profile query exception:', err)
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
  // Use Indonesian timezone (WIB/UTC+7)
  const now = new Date();
  const indonesianTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // Add 7 hours for WIB
  const today = indonesianTime.toISOString().split('T')[0];

  console.log('Getting today challenge for Indonesian date:', today);

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

export const getRandomChallenges = async (limit: number = 3): Promise<DailyChallenge[]> => {
  // Get challenges that haven't been used in the last 7 days using Indonesian timezone
  const now = new Date();
  const indonesianTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // Add 7 hours for WIB

  const sevenDaysAgo = new Date(indonesianTime);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  const today = indonesianTime.toISOString().split('T')[0];

  console.log('Using Indonesian timezone - Today:', today, 'Seven days ago:', sevenDaysAgoStr);

  // First, get the total count of available challenges
  const { count, error: countError } = await supabase
    .from('daily_challenges')
    .select('*', { count: 'exact', head: true })
    .or(`date.is.null,date.lt.${sevenDaysAgoStr}`)
    .neq('date', today)

  if (countError || !count || count === 0) {
    console.log('No challenges available or error counting:', countError)
    // Fallback: get any challenges that aren't for today
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('daily_challenges')
      .select('*')
      .neq('date', today)
      .limit(limit)

    if (fallbackError) {
      console.error('Error fetching fallback challenges:', fallbackError)
      return []
    }
    return fallbackData || []
  }

  // Generate random offset
  const randomOffset = Math.floor(Math.random() * Math.max(1, count - limit + 1))

  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*')
    .or(`date.is.null,date.lt.${sevenDaysAgoStr}`)
    .neq('date', today)
    .range(randomOffset, randomOffset + limit - 1)
    .order('id', { ascending: true })

  if (error) {
    console.error('Error fetching random challenges:', error)
    return []
  }
  return data || []
}

export const updateChallengeDate = async (challengeId: string, newDate: string): Promise<boolean> => {
  const { error } = await supabase
    .from('daily_challenges')
    .update({ date: newDate })
    .eq('id', challengeId)

  if (error) {
    console.error('Error updating challenge date:', error)
    return false
  }
  return true
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
      latitude,
      longitude,
      province,
      city,
      like_count,
      created_at,
      updated_at,
      points,
      activity_categories (
        name,
        base_points,
        group_category
      ),
      generated_image_url
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching detailed activities:', error)
    return []
  }
  return data
}

export const getProfileByProfileId = async (profileId: string): Promise<any | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId);

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data.length > 0 ? data[0] : null;
};

export const recalculateAllUserPoints = async () => {
  const { data: activities, error } = await supabase
    .from('activities')
    .select('user_id, points')
    .eq('status', 'approved');

  if (error) {
    console.error('Error fetching activities:', error);
    return { success: false, error };
  }


  const pointMap: Record<string, number> = {};
  for (const { user_id, points } of activities) {
    pointMap[user_id] = (pointMap[user_id] || 0) + points;
  }


  const updates = Object.entries(pointMap).map(async ([userId, totalPoints]) => {

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

  const { data: activities, error: activitiesError } = await supabase
    .from('activities')
    .select('user_id, points, province')
    .eq('status', 'approved');

  if (activitiesError) {
    console.error(' Error fetching activities:', activitiesError);
    return { success: false, error: activitiesError };
  }


  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, province');

  if (profilesError) {
    console.error(' Error fetching profiles:', profilesError);
    return { success: false, error: profilesError };
  }

  const userProvinceMap = Object.fromEntries(
    profiles.map(p => [p.id, p.province])
  );


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
    console.log(' Upsert result for province:', province, update);

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
    console.error(' Error fetching province_stats:', error);
    return { success: false, error };
  }


  const sorted = [...provinces].sort((a, b) => {
    if (b.total_points !== a.total_points) {
      return b.total_points - a.total_points;
    }
    return a.province.localeCompare(b.province);
  });


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


export const reassignProfileRanks = async () => {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, points, created_at')
    .order('points', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    console.error(' Gagal ambil data:', error);
    return { success: false, error: error.message };
  }

  const updates = profiles.map((profile, i) => ({
    id: profile.id,
    rank: i + 1
  }));

  const results = await Promise.allSettled(
    updates.map(update =>
      supabase.from('profiles').update({ rank: update.rank }).eq('id', update.id)
    )
  );

  const updated = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { success: true, updated, failed };
};




export const getActivityDetailsForDeletion = async (activityId: string): Promise<{ user_id: string; points: number } | null> => {
  const { data, error } = await supabase
    .from('activities')
    .select('user_id, points')
    .eq('id', activityId)
    .single();

  if (error) {
    console.error('Error fetching activity details for deletion:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  if ('user_id' in data && 'points' in data) {
    return { user_id: data.user_id, points: data.points };
  }
  return null;
};

export const decrementUserPoints = async (profileId: string, pointsToDecrement: number): Promise<boolean> => {
  const { data: currentProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', profileId)
    .single();

  if (fetchError || !currentProfile) {
    console.error('Error fetching current user points:', fetchError);
    return false;
  }

  const newPoints = Math.max(0, (currentProfile.points || 0) - pointsToDecrement);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ points: newPoints })
    .eq('id', profileId);

  if (updateError) {
    console.error('Error decrementing user points:', updateError);
    return false;
  }
  return true;
};

export const deleteActivityAndDecrementPoints = async (activityId: string): Promise<boolean> => {
  const activityDetails = await getActivityDetailsForDeletion(activityId);

  if (!activityDetails) {
    console.warn(`Activity with ID ${activityId} not found or details incomplete.`);
    return false;
  }

  const { error: deleteError } = await supabase
    .from('activities')
    .delete()
    .eq('id', activityId);

  if (deleteError) {
    console.error('Error deleting activity:', deleteError);
    return false;
  }

  const successDecrement = await decrementUserPoints(activityDetails.user_id, activityDetails.points);

  if (!successDecrement) {
    console.error('Failed to decrement user points after activity deletion.');
  }

  return true;
};


export const updateProfile = async ({
  full_name,
  username,
  province,
  clerk_id,
}: {
  full_name: string;
  username: string;
  province: string;
  clerk_id: string;
}) => {
  const { error } = await supabase
    .from('profiles')
    .update({ full_name, username, province })
    .eq('clerk_id', clerk_id);


  return { error };
};


