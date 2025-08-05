"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Trophy, Medal, Award } from "lucide-react";
import { DailyChallenge, ActivityHistory } from "@/lib/types/homepage";
import {
  usePublicStats,
  usePublicUserLeaderboard,
  usePublicProvinceLeaderboard,
  useUserActivities,
  useDailyChallenge,
} from "@/hooks/useSWRData";
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

const formatNumber = (num: number | undefined | null) => {
  if (num === undefined || num === null || isNaN(num)) {
    return "0";
  }
  
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

const formatPoints = (points: number | undefined | null) => {
  if (points === undefined || points === null || isNaN(points)) {
    return "0";
  }
  
  if (points >= 1000) {
    return (points / 1000).toFixed(1) + "k";
  }
  return points.toString();
};

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
  } else if (diffInHours < 168) {
    const days = Math.floor(diffInHours / 24);
    return `${days} hari lalu`;
  } else if (diffInHours < 720) {
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
  const [isClient, setIsClient] = useState(false);

  const { data: challengeData, isLoading: challengeLoading } = useDailyChallenge();
  const { data: userActivitiesData, isLoading: activitiesLoading } = useUserActivities(
    isSignedIn ? user?.id : undefined
  );
  const { data: statsData, isLoading: statsLoading, error: statsError } = usePublicStats();
  const { data: userLeaderboardData, isLoading: userLeaderboardLoading, error: userLeaderboardError } = usePublicUserLeaderboard();
  const { data: provinceLeaderboardData, isLoading: provinceLeaderboardLoading, error: provinceLeaderboardError } = usePublicProvinceLeaderboard();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const dailyChallenges: DailyChallenge[] = challengeData?.success ? challengeData.data : [];

  const activityHistory: ActivityHistory[] = Array.isArray(userActivitiesData)
    ? userActivitiesData.map((activity: any) => ({
        ...activity,
        relativeTime: isClient ? getRelativeTime(new Date(activity.date || activity.created_at)) : 'Loading...',
        categoryColor: activity.categoryColor || '#10B981'
      }))
    : [];

  const stats = {
    totalUsers: statsData?.totalUsers || 0,
    totalActivities: statsData?.totalActivities || 0,
    activeProvinces: statsData?.activeProvinces || 0,
  };

  const userLeaderboard: UserLeaderboard[] = (() => {
    const data = userLeaderboardData || []
    if (!Array.isArray(data)) return []
    
    return data
      .filter((user: any) => user && user.id)
      .slice(0, 5)
      .map((user: any, index: number) => ({
        id: user.id,
        username: user.name || user.username || user.full_name || 'Anonymous',
        full_name: user.full_name,
        province: user.province || 'Unknown',
        points: user.points || 0,
        rank: user.rank || index + 1,
      }))
  })()


  const provinceLeaderboard: ProvinceLeaderboard[] = (() => {
    const data = provinceLeaderboardData || []
    if (!Array.isArray(data)) return []
    
    console.log('🔍 Province data from province_stats:', data)
    
    return data
      .slice(0, 5)
      .map((province: any) => ({
        id: province.id || province.province,
        province: province.province,
        total_users: province.total_users || 0,
        total_activities: province.total_activities || 0,
        total_points: province.total_points || 0,
        rank: province.rank || 0
      }))
  })()

  const loading = statsLoading || userLeaderboardLoading || provinceLeaderboardLoading;

  if (!isSignedIn) {
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

  return (
    <AuthenticatedHomepage
      dailyChallenges={dailyChallenges}
      activityHistory={activityHistory}
      activityLoading={activitiesLoading}
      userName={user?.fullName || user?.username || user?.firstName || undefined}
    />
  );
}
