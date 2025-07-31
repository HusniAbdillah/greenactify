"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Trophy, Medal, Award } from "lucide-react";
import { fetchStats, type StatsData } from "@/lib/calculate-stats";
import "./globals.css";
import AuthenticatedHomepage from "@/components/homepage/AuthenticatedHomepage";
import UnauthenticatedHomepage from "@/components/homepage/UnauthenticatedHomepage";

interface UserLeaderboard {
  id: string;
  name: string | null;
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

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);

        // Fetch stats data
        const statsData = await fetchStats();
        setStats(statsData);

        const userResponse = await fetch("/api/leaderboard?type=users");
        if (userResponse.ok) {
          const userResult = await userResponse.json();
          const userData = userResult.data || userResult;

          const sortedUsers = userData
            .sort((a: any, b: any) => (b.points || 0) - (a.points || 0))
            .slice(0, 5)
            .map((user: any, index: number) => ({
              ...user,
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
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  // Render authenticated homepage for signed-in users
  if (isSignedIn) {
    return (
      <AuthenticatedHomepage
        userLeaderboard={userLeaderboard}
        loading={loading}
        formatPoints={formatPoints}
        getRankIcon={getRankIcon}
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
