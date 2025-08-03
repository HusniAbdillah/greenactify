"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Trophy, Medal, Award } from "lucide-react";
import { fetchStats, type StatsData } from "@/lib/calculate-stats";
import { DailyChallenge, ActivityHistory } from "@/lib/types/homepage";
import "./globals.css";
import UnauthenticatedHomepage from "@/components/homepage/UnauthenticatedHomepage";
import AuthenticatedHomepage from "@/components/homepage/AuthenticatedHomepage";

interface UserLeaderboard {
  id: string;
  username: string | null;
  full_name: string | null;
  province: string | null;
  points: number;
  rank: number;
}

interface ProvinceLeaderboard {
  id: number;
  province: string;
  total_users: number;
  total_activities: number;
  total_points: number;
  rank: number;
}

const formatNumber = (num: number) => {
  if (num >= 1500000) {
    return (num / 1000000).toFixed(1) + "M+";
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1500) {
    return (num / 1000).toFixed(1) + "k+";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
};

const formatPoints = (points: number) => {
  if (points >= 1000) {
    return (points / 1000).toFixed(1) + "k";
  }
  return points.toString();
};

// Function to format relative time
const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) {
      return 'Baru saja';
    }
    return `${diffInMinutes} menit lalu`;
  } else if (diffInHours < 24) {
    return `${diffInHours} jam lalu`;
  } else if (diffInHours < 48) {
    return '1 hari lalu';
  } else if (diffInHours < 168) { // 7 days
    const days = Math.floor(diffInHours / 24);
    return `${days} hari lalu`;
  } else if (diffInHours < 720) { // 30 days
    const weeks = Math.floor(diffInHours / 168);
    return `${weeks} minggu lalu`;
  } else {
    const months = Math.floor(diffInHours / 720);
    return `${months} bulan lalu`;
  }
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Award className="w-5 h-5 text-orange-500" />;
    default:
      return (
        <span className="w-5 h-5 bg-greenDark rounded-full flex items-center justify-center text-xs font-bold text-white">
          {rank}
        </span>
      );
  }
};

export default function HomePage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"users" | "provinces">("users");
  const [userLeaderboard, setUserLeaderboard] = useState<UserLeaderboard[]>([]);
  const [provinceLeaderboard, setProvinceLeaderboard] = useState<
    ProvinceLeaderboard[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalActivities: 0,
    activeProvinces: 0,
  });

  // Authenticated user state
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [activityHistory, setActivityHistory] = useState<ActivityHistory[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set client flag after mount to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        if (isSignedIn) {
          setActivityLoading(true);
        }

        // Fetch stats data
        const statsData = await fetchStats();
        setStats(statsData);

        const userResponse = await fetch("/api/users");
        if (userResponse.ok) {
          const userResult = await userResponse.json();
          const userData = userResult.data || userResult;

          const sortedUsers = userData
            .sort((a: any, b: any) => (b.points || 0) - (a.points || 0))
            .slice(0, 5)
            .map((user: any, index: number) => ({
              id: user.id,
              username: user.name || user.username || user.full_name,
              full_name: user.full_name,
              province: user.province,
              points: user.points || 0,
              rank: index + 1,
            }));
          setUserLeaderboard(sortedUsers);
        }

        const provinceResponse = await fetch("/api/provinces");
        if (provinceResponse.ok) {
          const provinceResult = await provinceResponse.json();
          const provinceData = provinceResult.data || provinceResult;

          const sortedProvinces = provinceData
            .sort(
              (a: any, b: any) => (b.total_points || 0) - (a.total_points || 0)
            )
            .slice(0, 5)
            .map((province: any, index: number) => ({
              ...province,
              rank: index + 1,
            }));
          setProvinceLeaderboard(sortedProvinces);
        }

        // Fetch authenticated user data if signed in
        if (isSignedIn) {
          // Fetch daily challenge
          const challengeResponse = await fetch("/api/daily-challenge");
          if (challengeResponse.ok) {
            const challengeResult = await challengeResponse.json();
            console.log('Challenge API response:', challengeResult);
            if (challengeResult.success && challengeResult.data) {
              // The API already returns an array in challengeResult.data
              setDailyChallenges(challengeResult.data);
            }
          }

          // Fetch activity history (real data from activities API)
          const activityResponse = await fetch("/api/activities");
          if (activityResponse.ok) {
            const activityResult = await activityResponse.json();
            if (Array.isArray(activityResult) && activityResult.length > 0) {
              // Transform the real API data to match the expected format
              const transformedActivities = activityResult.slice(0, 3).map((activity: any) => ({
                id: activity.id,
                userId: activity.user_id,
                type: activity.activity_categories?.name || activity.title,
                description: activity.description || 'Tidak ada deskripsi',
                points: activity.points || 0,
                date: new Date(activity.created_at),
                status: activity.status || 'completed',
                category: activity.activity_categories?.group_category || 'other',
                location: activity.province || 'Lokasi tidak diketahui',
                image_url: activity.image_url || '',
                verified: !!activity.verified_at,
                challenge_id: null, // Real API doesn't have challenge_id in this format
                relativeTime: isClient ? getRelativeTime(new Date(activity.created_at)) : 'Memuat...'
              }));
              setActivityHistory(transformedActivities);
            } else {
              setActivityHistory([]);
            }
          } else {
            console.error('Failed to fetch activities:', activityResponse.statusText);
            setActivityHistory([]);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set empty arrays for activity history if there's an error
        if (isSignedIn) {
          setActivityHistory([]);
          setDailyChallenges([]);
        }
      } finally {
        setLoading(false);
        if (isSignedIn) {
          setActivityLoading(false);
        }
      }
    };

    fetchLeaderboardData();
  }, [isSignedIn]);

  // Update relative times after client mount to prevent hydration mismatch
  useEffect(() => {
    if (isClient && activityHistory.length > 0) {
      setActivityHistory(prev => prev.map(activity => ({
        ...activity,
        relativeTime: getRelativeTime(activity.date)
      })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, activityHistory.length]);

  // Show authenticated homepage for signed in users
  if (isSignedIn) {
    return (
      <AuthenticatedHomepage
        dailyChallenges={dailyChallenges}
        activityHistory={activityHistory}
        activityLoading={activityLoading}
        userName={user?.firstName || user?.fullName || undefined}
      />
    );
  }

  // Render unauthenticated homepage for guests
  return (
    <UnauthenticatedHomepage
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      userLeaderboard={userLeaderboard}
      provinceLeaderboard={provinceLeaderboard}
      loading={loading}
      stats={stats}
      formatNumber={formatNumber}
      formatPoints={formatPoints}
      getRankIcon={getRankIcon}
    />
  );
}
