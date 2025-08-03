'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState, useCallback } from 'react'
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

import {
  Profile,
  Activity,
  LeaderboardUser,
  LeaderboardProvince,
  ActivityCategory,
  DailyChallenge,
  UserChallenge,
} from '@/lib/types/supabase'

export const useProfile = () => {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!isLoaded) return
    
    if (!user?.id) {
      console.log('No user ID available')
      setLoading(false)
      setError('No user ID available')
      return
    }

    try {
      console.log('🔍 Fetching profile for user:', user.id)
      const data = await getProfileByUserId(user.id)
      setProfile(data)
      setError(null)
      console.log(' Profile fetched:', data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      console.error(' Profile fetch error:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [user?.id, isLoaded])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

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
        console.log(' Fetching leaderboard data...')
        const isConnected = await testSupabaseConnection()
        if (!isConnected) {
          throw new Error('Supabase connection failed')
        }

        const [usersData, provincesData] = await Promise.all([
          getLeaderboardUsers(10),
          getLeaderboardProvinces(10)
        ])

        console.log(' Leaderboard data:', { usersData, provincesData })
        setUsers(usersData)
        setProvinces(provincesData)
        setError(null)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error(' Leaderboard fetch error:', errorMsg)
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
        console.error(' Categories fetch error:', errorMsg)
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




export type ActivityItem = {
  id: string; 
  user_id: string; 
  category_id: string; 
  title: string;
  description?: string | null;
  points: number;
  image_url?: string | null
  latitude?: number | null; 
  longitude?: number | null; 
  province?: string | null;
  like_count: number;
  created_at: string; 
  updated_at: string; 
  generated_image_url?: string | null;
  activity_categories: {
    name: string;
    base_points: number;
    group_category: string;
  };
};
export function useActivities() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/activities')
      if (!res.ok) throw new Error('Gagal mengambil data')
      const data = await res.json()
      setActivities(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Terjadi kesalahan'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  return { activities, loading, error, refetch: fetchActivities } 
}

interface UserProfile {
  id: string; 
  email: string;
  full_name: string ;
  username: string | null;
  avatar_url: string | null;
  points: number | 0;
  province: string | null;
  last_activity_upload: string | null;
  total_activities: number | null;
  created_at: string  ;
  updated_at: string | null; 
  clerk_id: string | null;
  rank: number | null;
}

export function useProfiles() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/profile');

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Gagal mengambil data profil' }));
        throw new Error(errorData.error || errorData.message || 'Gagal mengambil data profil');
      }

      const data: UserProfile = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("Error in useProfile hook:", err);
      setError(err instanceof Error ? err : new Error('Terjadi kesalahan tidak dikenal saat mengambil profil.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return { profile, loading, error, refetchProfile: fetchUserProfile };
}




export const handleDeleteActivity = async (activityId: string): Promise<boolean> => {
  try {

    const res = await fetch(`/api/activities/delete/${activityId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Failed to delete activity:', errorData.error);
      return false;
    }

    const data = await res.json();
    console.log(data.message);
    window.location.reload();
    return true;

  } catch (error) {
    console.error('Error deleting activity:', error);
    return false;
  }
};

export async function handleUpdateActivity(
  id: string,
  title: string,
  location_name: string,
  image_url: string
) {
  try {
    const res = await fetch('/api/activities/edit', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title, location_name, image_url }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Gagal update aktivitas')
    }

    return true
  } catch (err: any) {
    alert('Gagal update: ' + err.message)
    return false
  }
}




export function useRecalculatePoints() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const callAPI = async () => {
      try {
        const res = await fetch('/api/points', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unknown error');
        console.log(' Recalculated:', data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    callAPI();
  }, []);

  return { loading, error };
}




export function useRefreshProvinceStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<null | { updated: number; failed: number }>(null);

  useEffect(() => {
    const callAPI = async () => {
      try {
        const res = await fetch('/api/refresh-province');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Unknown error');
        setResult(json);
        setError(null);
        console.log('🌍 Province stats refreshed:', json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    callAPI();
  }, []);

  return { loading, error, result };
}

export const useRecalculateProvinceRanks = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<number | null>(null);

  useEffect(() => {
    const recalculate = async () => {
      try {
        const res = await fetch('/api/recalculate/province-rank', {
          method: 'POST',
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || 'Unknown error');
        }

        setUpdated(json.updated);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    recalculate();
  }, []);

  return { loading, error, updated };
};




export function useReassignRank(autoRun = false) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    updated?: number;
    failed?: number;
    error?: string;
  } | null>(null);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recalculate/user-rank');
      const json = await res.json();
      setResult(json);
    } catch (err) {
      setResult({ success: false, error: 'Gagal fetch API' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoRun) run();
  }, [autoRun]);

  return { run, loading, result };
}

export type ProvinceStatItem = {
  id: string
  province: string
  total_users: number
  total_activities: number
  total_points: number
  avg_points_per_user: number
  coordinates: Record<string, any> | null
  updated_at: string
  rank: number | null
}