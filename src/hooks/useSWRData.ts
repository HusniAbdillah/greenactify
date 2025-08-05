import {useUser} from '@clerk/nextjs';
import {useMemo} from 'react';
import useSWR from 'swr';

export const fetcher = (url: string) =>
    fetch(url, {headers: {'Content-Type': 'application/json'}}).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    });

export function useProvinces() {
  const {user} = useUser();
  const key = null;  // user?.id ? `/api/provinces?userId=${user.id}` : null;

  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000,  // 1 hour
    refreshInterval: 0,         // No auto refresh
    shouldRetryOnError: false,
  });
}

export function useProvinceStats() {
  const {user} = useUser();
  const key = user?.id ? `/api/province-bare?userId=${user.id}` : null;

  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 600000,  // 10 minutes
    refreshInterval: 300000,   // 5 minutes
    shouldRetryOnError: false,
  });
}

export function useUserProfile(userId?: string) {
  const {user} = useUser();
  const targetUserId = userId || user?.id;
  const key = targetUserId && user?.id ?
      `/api/users/${targetUserId}?currentUser=${user.id}` :
      null;

  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,  // 5 minutes
    refreshInterval: 0,
    shouldRetryOnError: false,
  });
}

export function useUsers() {
  const {user} = useUser();
  const key = user?.id ? `/api/users?currentUser=${user.id}` : null;

  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 180000,  // 3 minutes
    refreshInterval: 300000,   // 5 minutes
    shouldRetryOnError: false,
  });
}

export function useChallenge(challengeId?: string) {
  const {user} = useUser();
  const key =
      null;  // challengeId && user?.id ?
             // `/api/daily-challenge/${challengeId}?userId=${user.id}` : null;

  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 600000,  // 10 minutes
    refreshInterval: 0,
    shouldRetryOnError: false,
  });
}

export function usePopularActivities() {
  const {user} = useUser();
  const key =
      null;  // user?.id ? `/api/activities/popular?userId=${user.id}` : null;

  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,  // 5 minutes
    refreshInterval: 600000,   // 10 minutes
    shouldRetryOnError: false,
  });
}

export function useProvinceData() {
  const {user} = useUser();
  const key = user?.id ? `/api/provinces?limit=10&userId=${user.id}` : null;

  const {data, error, isLoading, mutate} = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 1800000,  // 30 minutes
    refreshInterval: 900000,    // 15 minutes
    shouldRetryOnError: false,
  });

  const provinceData = useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) return [];

    return data.data.map(
        (province: any) => ({
          id: province.id || province.province,
          name: province.province,
          totalActivities: province.total_activities || 0,
          totalUsers: province.total_users || 0,
          totalPoints: province.total_points || 0,
          rank: province.rank || null,
          averagePerUser: province.avg_points_per_user ?
              parseFloat(province.avg_points_per_user.toFixed(2)) :
              0,
        }));
  }, [data]);

  return {
    provinceData,
    loading: isLoading,
    error,
    mutate,
  };
}

export function useDashboardStats() {
  const {user} = useUser();
  const key = user?.id ? `/api/stats?userId=${user.id}` : null;

  const {data: activities, error: activitiesError} = useSWR(key, fetcher, {
    dedupingInterval: 180000,
    refreshInterval: 300000,
    shouldRetryOnError: false,
  });

  return useMemo(
      () => ({
        totalActivities: activities?.totalActivities || 0,
        totalParticipants: activities?.totalUsers || 0,
        totalPoints: activities?.totalPoints || 0,
        activeRegions: activities?.activeProvinces || 0,
        loading: !activities && !activitiesError,
        error: activitiesError,
      }),
      [activities, activitiesError]);
}

import {mutate} from 'swr';

export const revalidateProvinces = (userId: string) =>
    mutate(`/api/provinces?userId=${userId}`);
export const revalidateActivities = (userId: string) =>
    mutate(`/api/activities/getAll?userId=${userId}`);
export const revalidateStats = (userId: string) =>
    mutate(`/api/stats?userId=${userId}`);
export const revalidateUser = (userId: string, targetUserId: string) =>
    mutate(`/api/users/${targetUserId}?currentUser=${userId}`);

export const revalidateLeaderboard = (userId: string) => {
  mutate(`/api/users?currentUser=${userId}`);
  mutate(`/api/province-bare?userId=${userId}`);
};

export function useRevalidation() {
  const {user} = useUser();

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
    revalidateUser: (targetUserId: string) =>
        user?.id && revalidateUser(user.id, targetUserId),
    revalidateLeaderboard: () => user?.id && revalidateLeaderboard(user.id),
  };
}

export function useDailyChallenge() {
  const {user} = useUser();
  const key = user?.id ? `/api/daily-challenge?userId=${user.id}` : null;

  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 1800000,
    refreshInterval: 3600000,
    shouldRetryOnError: false,
    errorRetryCount: 1,
    staleTime: 1800000,
  });
}

export function useUserActivities(targetUserId?: string) {
  const {user} = useUser();
  const userId = targetUserId || user?.id;

  const key =
      userId && user?.id && userId !== 'undefined' && userId !== 'null' ?
      `/api/activities/user/${userId}?currentUser=${user.id}` :
      null;

  const {data, error, isLoading, mutate} = useSWR(key, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 30000,
    refreshInterval: 120000,
    shouldRetryOnError: false,
    errorRetryCount: 2,
  });

  const activities = useMemo(() => {
    if (!data) return [];

    let rawActivities = [];
    if (data?.success && Array.isArray(data.data)) {
      rawActivities = data.data;
    } else if (Array.isArray(data)) {
      rawActivities = data;
    }

    return rawActivities.map(
        (activity: any) => ({
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
  const {user} = useUser();
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

export function useStats() {
  const {user} = useUser();
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

export function useProvinceLeaderboard() {
  const {user} = useUser();

  const {data, error, isLoading} =
      useSWR(user?.id ? '/api/provinces' : null, fetcher, {
        refreshInterval: 60000,
        revalidateOnFocus: true,
        errorRetryCount: 3,
        onError: (error) => {
          console.error('❌ useProvinceLeaderboard error:', error)
        }
      });

  const processedData = Array.isArray(data?.data) ?
      data.data.map((province: any) => ({
                      id: province.id || province.province,
                      province: province.province,
                      total_users: province.total_users || 0,
                      total_activities: province.total_activities || 0,
                      total_points: province.total_points || 0,
                      rank: province.rank || 0,
                      avg_points_per_user: province.avg_points_per_user || 0,
                      coordinates: province.coordinates || null,
                    })) :
      [];

  return {data: processedData, error, isLoading};
}

export function useUserLeaderboard() {
  const {user} = useUser();
  const {data, error, isLoading} = useSWR(
      user?.id ? '/api/users?orderBy=points&orderDirection=desc&limit=50' :
                 null,
      fetcher, {
        refreshInterval: 60000,
        revalidateOnFocus: true,
        errorRetryCount: 3,
        onError: (error) => {
          console.error('❌ useUserLeaderboard error:', error)
        }
      })

  return {
    data: data?.data || [], error, isLoading
  }
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

export function usePublicStats() {
  const {data, error, isLoading} = useSWR('/api/province-stats', fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    errorRetryCount: 3,
    errorRetryInterval: 2000,
    onError: (error) => {
      console.error('❌ usePublicStats error:', error)
    }
  })


  const stats = data?.data || {
    totalUsers: 0, totalActivities: 0, activeProvinces: 0, totalPoints: 0
  }

  return {
    data: stats, error, isLoading, totalUsers: stats.totalUsers,
        totalActivities: stats.totalActivities,
        activeProvinces: stats.activeProvinces, totalPoints: stats.totalPoints
  }
}

export function usePublicUserLeaderboard() {
  const {data, error, isLoading} = useSWR(
      '/api/users?orderBy=points&orderDirection=desc&limit=50', fetcher, {
        refreshInterval: 60000,
        revalidateOnFocus: true,
        errorRetryCount: 3,
        fallbackData: {data: []},
        onError: (error) => {
          console.error('❌ usePublicUserLeaderboard error:', error)
        }
      })

  console.log(
      '🔍 usePublicUserLeaderboard from /api/users:', {data, error, isLoading})

  const processedData = data?.data ||
      []

      return {
    data: processedData, error, isLoading
  }
}

export function usePublicProvinceLeaderboard() {
  const {data, error, isLoading} = useSWR('/api/provinces', fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
    errorRetryCount: 3,
    onError: (error) => {
      console.error('❌ usePublicProvinceLeaderboard error:', error)
    }
  });

  const processedData = Array.isArray(data?.data) ?
      data.data.map((province: any) => ({
                      id: province.id || province.province,
                      province: province.province,
                      total_users: province.total_users || 0,
                      total_activities: province.total_activities || 0,
                      total_points: province.total_points || 0,
                      rank: province.rank || 0,
                      avg_points_per_user: province.avg_points_per_user || 0,
                      coordinates: province.coordinates || null,
                    })) :
      [];

  return {data: processedData, error, isLoading};
}

export function usePublicDailyChallenge() {
  return {
    data: null, error: null, isLoading: false
  }
}

export function usePublicProvinceData() {
  const {data, error, isLoading, mutate} = useSWR(null, fetcher, {
    refreshInterval: 300000,
    revalidateOnFocus: true,
    errorRetryCount: 3,
    onError: (error) => {
      console.error('❌ usePublicProvinceData error:', error)
    }
  });

  const provinceData = useMemo(() => {
    return [];
  }, [data]);

  return {
    provinceData,
    loading: false,
    error: null,
    mutate,
  };
}


export function useSmartStats() {
  const {user} = useUser();
  return usePublicStats();
}

export function useSmartUserLeaderboard() {
  const {user} = useUser();

  const authenticatedResult = useUserLeaderboard();
  const publicResult = usePublicUserLeaderboard();

  if (user?.id) {
    return authenticatedResult;
  } else {
    return publicResult;
  }
}

export function useSmartProvinceLeaderboard() {
  const {user} = useUser();

  const authenticatedResult = useProvinceLeaderboard();
  const publicResult = usePublicProvinceLeaderboard();

  if (user?.id) {
    return authenticatedResult;
  } else {
    return publicResult;
  }
}
