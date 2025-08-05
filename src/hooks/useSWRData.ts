// src/hooks/useSWRData.ts
import useSWR from 'swr';
import { useMemo } from 'react';
import { useUser } from '@clerk/nextjs';

// Basic fetcher with user context
export const fetcher = (url: string) =>
  fetch(url, { headers: { 'Content-Type': 'application/json' } }).then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json();
  });

// Hook untuk data provinces dengan cache long-term
export function useProvinces() {
  const { user } = useUser();
  const key = user?.id ? `/api/provinces?userId=${user.id}` : null;
  
  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000, // 1 hour
    refreshInterval: 0, // No auto refresh
    shouldRetryOnError: false,
  });
}

// Hook untuk province stats dengan cache medium-term
export function useProvinceStats() {
  const { user } = useUser();
  const key = user?.id ? `/api/province-bare?userId=${user.id}` : null;
  
  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 600000, // 10 minutes
    refreshInterval: 300000, // 5 minutes
    shouldRetryOnError: false,
  });
}

export function useUserProfile(userId?: string) {
  const { user } = useUser();
  // Only fetch if userId matches current user or no userId provided (use current user)
  const targetUserId = userId || user?.id;
  const key = targetUserId && user?.id ? `/api/users/${targetUserId}?currentUser=${user.id}` : null;
  
  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 minutes
    refreshInterval: 0, // Profile rarely changes
    shouldRetryOnError: false,
  });
}

// Hook untuk users leaderboard
export function useUsers() {
  const { user } = useUser();
  const key = user?.id ? `/api/users?currentUser=${user.id}` : null;
  
  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 180000, // 3 minutes
    refreshInterval: 300000, // 5 minutes
    shouldRetryOnError: false,
  });
}

// Hook untuk challenge data
export function useChallenge(challengeId?: string) {
  const { user } = useUser();
  const key = challengeId && user?.id ? `/api/daily-challenge/${challengeId}?userId=${user.id}` : null;
  
  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 600000, // 10 minutes
    refreshInterval: 0,
    shouldRetryOnError: false,
  });
}

// Hook untuk popular activities
export function usePopularActivities() {
  const { user } = useUser();
  const key = user?.id ? `/api/activities/popular?userId=${user.id}` : null;
  
  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 minutes
    refreshInterval: 600000, // 10 minutes
    shouldRetryOnError: false,
  });
}

// 🔧 Fixed: Hook dengan conditional fetching dan computed data
export function useProvinceData() {
  const { user } = useUser();
  const key = user?.id ? `/api/provinces?limit=50&userId=${user.id}` : null;
  
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 1800000, // 30 minutes
    refreshInterval: 900000, // 15 minutes
    shouldRetryOnError: false,
  });

  // Memoize computed data
  const provinceData = useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) return [];
    
    return data.data.map((province: any) => ({
      id: province.id || province.province,
      name: province.province,
      totalActivities: province.total_activities || 0,
      totalUsers: province.total_users || 0,
      totalPoints: province.total_points || 0,
      rank: province.rank || null,
      averagePerUser: province.avg_points_per_user 
        ? parseFloat(province.avg_points_per_user.toFixed(2)) 
        : 0,
    }));
  }, [data]);

  return {
    provinceData,
    loading: isLoading,
    error,
    mutate,
  };
}

// 🔧 Fixed: Hook untuk statistics dengan multiple endpoints
export function useDashboardStats() {
  const { user } = useUser();
  const key = user?.id ? `/api/stats?userId=${user.id}` : null;
  
  const { data: activities, error: activitiesError } = useSWR(key, fetcher, {
    dedupingInterval: 180000,
    refreshInterval: 300000,
    shouldRetryOnError: false,
  });

  return useMemo(() => ({
    totalActivities: activities?.totalActivities || 0,
    totalParticipants: activities?.totalUsers || 0,
    totalPoints: activities?.totalPoints || 0,
    activeRegions: activities?.activeProvinces || 0,
    loading: !activities && !activitiesError,
    error: activitiesError,
  }), [activities, activitiesError]);
}

// Manual revalidation functions with user context
import { mutate } from 'swr';

export const revalidateProvinces = (userId: string) => mutate(`/api/provinces?userId=${userId}`);
export const revalidateActivities = (userId: string) => mutate(`/api/activities/getAll?userId=${userId}`);
export const revalidateStats = (userId: string) => mutate(`/api/stats?userId=${userId}`);
export const revalidateUser = (userId: string, targetUserId: string) => mutate(`/api/users/${targetUserId}?currentUser=${userId}`);

export const revalidateLeaderboard = (userId: string) => {
  mutate(`/api/users?currentUser=${userId}`);
  mutate(`/api/province-bare?userId=${userId}`);
};

export function useRevalidation() {
  const { user } = useUser();
  
  const revalidateAll = () => {
    if (!user?.id) return;
    revalidateProvinces(user.id);
    revalidateActivities(user.id);
    revalidateStats(user.id);
    revalidateLeaderboard(user.id);
  };

  const revalidateAfterActivity = () => {
    if (!user?.id) return;
    revalidateActivities(user.id);
    revalidateStats(user.id);
    setTimeout(() => {
      revalidateProvinces(user.id);
    }, 2000);
  };

  return {
    revalidateAll,
    revalidateAfterActivity,
    revalidateProvinces: () => user?.id && revalidateProvinces(user.id),
    revalidateActivities: () => user?.id && revalidateActivities(user.id),
    revalidateStats: () => user?.id && revalidateStats(user.id),
    revalidateUser: (targetUserId: string) => user?.id && revalidateUser(user.id, targetUserId),
    revalidateLeaderboard: () => user?.id && revalidateLeaderboard(user.id),
  };
}

// 🔄 DAILY CHALLENGE - Cache lama (berubah jarang)
export function useDailyChallenge() {
  const { user } = useUser();
  const key = user?.id ? `/api/daily-challenge?userId=${user.id}` : null;
  
  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 1800000, // 30 menit
    refreshInterval: 3600000,  // 1 jam auto refresh
    shouldRetryOnError: false,
    errorRetryCount: 1,
    staleTime: 1800000, // Data dianggap fresh selama 30 menit
  });
}

// ⚡ USER ACTIVITIES - Cache pendek (lebih real-time)
export function useUserActivities(targetUserId?: string) {
  const { user } = useUser();
  const userId = targetUserId || user?.id;
  
  const key = userId && user?.id && userId !== 'undefined' && userId !== 'null' 
    ? `/api/activities/user/${userId}?currentUser=${user.id}` 
    : null;
  
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 30000,
    refreshInterval: 120000,
    shouldRetryOnError: false,
    errorRetryCount: 2,
    onSuccess: (data) => {
      console.log('✅ SWR Success - User Activities:', {
        targetUserId,
        currentUserId: user?.id,
        hasData: !!data,
        success: data?.success,
        count: data?.data?.length || data?.length || 0,
      });
    },
    onError: (error) => {
      console.error('❌ SWR Error - User Activities:', error);
    }
  });

  const activities = useMemo(() => {
    if (!data) return [];
    
    let rawActivities = [];
    if (data?.success && Array.isArray(data.data)) {
      rawActivities = data.data;
    } else if (Array.isArray(data)) {
      rawActivities = data;
    }

    return rawActivities.map((activity: any) => ({
      id: activity.id,
      userId: activity.userId || activity.user_id,
      type: activity.type || activity.title,
      description: activity.description,
      points: activity.points || 0,
      date: new Date(activity.date || activity.created_at),
      status: activity.status,
      category: activity.category,
      location: activity.location || activity.province,
      image_url: activity.image_url || '',
      verified: activity.verified,
      challenge_id: activity.challenge_id,
      relativeTime: undefined,
      categoryColor: '#10B981'
    }));
  }, [data]);

  return {
    data: activities,
    isLoading,
    error,
    mutate,
    isEmpty: !isLoading && activities.length === 0
  };
}

export function useHeatmapData() {
  const { user } = useUser();
  const key = user?.id ? `/api/activities/heatmap?userId=${user.id}` : null;
  
  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 600000,
    refreshInterval: 1800000,
    shouldRetryOnError: false,
    errorRetryCount: 1,
    staleTime: 600000,
  });
}

// STATS - Cache medium
export function useStats() {
  const { user } = useUser();
  const key = user?.id ? `/api/stats?userId=${user.id}` : null;
  
  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000,
    refreshInterval: 600000,
    shouldRetryOnError: false,
    errorRetryCount: 1,
  });
}

// 🏆 LEADERBOARD - Cache medium
export function useUserLeaderboard() {
  const { user } = useUser();
  const key = user?.id ? `/api/users?currentUser=${user.id}` : null;
  
  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000,
    refreshInterval: 600000,
    shouldRetryOnError: false,
    errorRetryCount: 1,
  });
}

export function useProvinceLeaderboard() {
  const { user } = useUser();
  const key = user?.id ? `/api/provinces?currentUser=${user.id}` : null;
  
  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000,
    refreshInterval: 600000,
    shouldRetryOnError: false,
    errorRetryCount: 1,
  });
}

export function clearUserCache(userId: string) {
  const patterns = [
    `/api/provinces?userId=${userId}`,
    `/api/province-bare?userId=${userId}`,
    `/api/users?currentUser=${userId}`,
    `/api/stats?userId=${userId}`,
    `/api/daily-challenge?userId=${userId}`,
    `/api/activities/popular?userId=${userId}`,
    `/api/activities/heatmap?userId=${userId}`,
    `/api/profile?userId=${userId}`,
  ];
  
  patterns.forEach(pattern => {
    mutate(pattern, undefined, false);
  });
}
