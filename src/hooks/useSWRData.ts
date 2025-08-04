// src/hooks/useSWRData.ts
import useSWR from 'swr';
import { useMemo } from 'react';

// Basic fetcher
export const fetcher = (url: string) =>
  fetch(url, { headers: { 'Content-Type': 'application/json' } }).then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json();
  });

// Hook untuk data provinces dengan cache long-term
export function useProvinces() {
  return useSWR('/api/provinces', {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000, // 1 hour
    refreshInterval: 0, // No auto refresh
    shouldRetryOnError: false, // 🔧 Prevent infinite retry loops
  });
}

// Hook untuk province stats dengan cache medium-term
export function useProvinceStats() {
  return useSWR('/api/province-bare', {
    revalidateOnFocus: false,
    dedupingInterval: 600000, // 10 minutes
    refreshInterval: 300000, // 5 minutes
    shouldRetryOnError: false, // 🔧 Prevent infinite retry loops
  });
}

export function useUserProfile(userId: string) {
  // 🔧 Only create key if userId exists
  const key = userId ? `/api/users/${userId}` : null;
  
  return useSWR(key, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 minutes
    refreshInterval: 0, // Profile rarely changes
    shouldRetryOnError: false,
  });
}

// Hook untuk users leaderboard
export function useUsers() {
  return useSWR('/api/users', {
    revalidateOnFocus: false,
    dedupingInterval: 180000, // 3 minutes
    refreshInterval: 300000, // 5 minutes
    shouldRetryOnError: false,
  });
}

// Hook untuk challenge data
export function useChallenge(challengeId?: string) {
  // 🔧 Only create key if challengeId exists
  const key = challengeId ? `/api/daily-challenge/${challengeId}` : null;
  
  return useSWR(key, {
    revalidateOnFocus: false,
    dedupingInterval: 600000, // 10 minutes
    refreshInterval: 0,
    shouldRetryOnError: false,
  });
}

// Hook untuk popular activities
export function usePopularActivities() {
  return useSWR('/api/activities/popular', {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 minutes
    refreshInterval: 600000, // 10 minutes
    shouldRetryOnError: false,
  });
}

// 🔧 Fixed: Hook dengan conditional fetching dan computed data
export function useProvinceData() {
  const { data, error, isLoading, mutate } = useSWR('/api/provinces?limit=50', {
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
  const { data: activities, error: activitiesError } = useSWR('/api/stats', {
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

// Manual revalidation functions
import { mutate } from 'swr';

export const revalidateProvinces = () => mutate('/api/provinces');
export const revalidateActivities = () => mutate('/api/activities/getAll');
export const revalidateStats = () => mutate('/api/stats');

export const revalidateUser = (userId: string) => mutate(`/api/users/${userId}`);

export const revalidateLeaderboard = () => {
  mutate('/api/users');
  mutate('/api/province-bare');
};

// 🔧 Hook untuk trigger revalidation setelah user action
export function useRevalidation() {
  const revalidateAll = () => {
    revalidateProvinces();
    revalidateActivities();
    revalidateStats();
    revalidateLeaderboard();
  };

  const revalidateAfterActivity = () => {
    revalidateActivities();
    revalidateStats();
    // Delay province stats revalidation
    setTimeout(() => {
      revalidateProvinces();
    }, 2000);
  };

  return {
    revalidateAll,
    revalidateAfterActivity,
    revalidateProvinces,
    revalidateActivities,
    revalidateStats,
    revalidateUser,
    revalidateLeaderboard,
  };
}

// 🔄 DAILY CHALLENGE - Cache lama (berubah jarang)
export function useDailyChallenge() {
  return useSWR('/api/daily-challenge', fetcher, {
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
export function useUserActivities(userId?: string) {
  const key = userId && userId !== 'undefined' && userId !== 'null' 
    ? `/api/activities/user/${userId}` 
    : null;
  
  const { data, error, isLoading, mutate } = useSWR(key, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 30000,  // 30 detik
    refreshInterval: 120000,  // 2 menit auto refresh  
    shouldRetryOnError: false,
    errorRetryCount: 2,
    onSuccess: (data) => {
      console.log('✅ SWR Success - User Activities:', {
        hasData: !!data,
        success: data?.success,
        count: data?.data?.length || data?.length || 0,
        firstItem: data?.data?.[0] || data?.[0]
      });
    },
    onError: (error) => {
      console.error('❌ SWR Error - User Activities:', error);
    }
  });

  const activities = useMemo(() => {
    console.log('🔄 Processing user activities:', {
      rawData: data,
      hasSuccess: data?.success,
      isArray: Array.isArray(data?.data),
      dataLength: data?.data?.length || 0
    });

    let rawActivities = [];
    if (data?.success && Array.isArray(data.data)) {
      rawActivities = data.data; // New API format
    } else if (Array.isArray(data)) {
      rawActivities = data; // Direct array format
    }

    return rawActivities.map((activity: any) => ({
      id: activity.id,
      userId: activity.userId || activity.user_id,
      type: activity.type || activity.title,
      description: activity.description,
      points: activity.points || 0,
      date: new Date(activity.date || activity.created_at), // Convert to Date
      status: activity.status,
      category: activity.category,
      location: activity.location || activity.province,
      image_url: activity.image_url || '',
      verified: activity.verified,
      challenge_id: activity.challenge_id,
      // Will be added in frontend
      relativeTime: undefined,
      categoryColor: '#10B981'
    }));
  }, [data]);

  console.log('🎯 Final activities result:', {
    count: activities.length,
    firstActivity: activities[0]
  });

  return {
    data: activities,
    isLoading,
    error,
    mutate,
    isEmpty: !isLoading && activities.length === 0
  };
}

// HEATMAP DATA - Cache medium (tidak terlalu penting real-time)
export function useHeatmapData() {
  return useSWR('/api/activities/heatmap', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 600000,  // 10 menit
    refreshInterval: 1800000,  // 30 menit auto refresh
    shouldRetryOnError: false,
    errorRetryCount: 1,
    staleTime: 600000, // Data fresh selama 10 menit
  });
}

// STATS - Cache medium
export function useStats() {
  return useSWR('/api/stats', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000,  // 5 menit
    refreshInterval: 600000,   // 10 menit auto refresh
    shouldRetryOnError: false,
    errorRetryCount: 1,
  });
}

// 🏆 LEADERBOARD - Cache medium
export function useUserLeaderboard() {
  return useSWR('/api/users', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000,  // 5 menit
    refreshInterval: 600000,   // 10 menit auto refresh
    shouldRetryOnError: false,
    errorRetryCount: 1,
  });
}

export function useProvinceLeaderboard() {
  return useSWR('/api/provinces', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000,  // 5 menit
    refreshInterval: 600000,   // 10 menit auto refresh
    shouldRetryOnError: false,
    errorRetryCount: 1,
  });
}

// Add this new hook for persebaran page
export function useActivities() {
  return useSWR('/api/activities/getAll', {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000, // 5 minutes
    refreshInterval: 600000,  // 10 minutes
    shouldRetryOnError: false,
    errorRetryCount: 1
  });
}
