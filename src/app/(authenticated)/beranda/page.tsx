'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Trophy, Medal, Award } from "lucide-react";
import { DailyChallenge, ActivityHistory } from "@/lib/types/homepage";
import AuthenticatedHomepage from "@/components/homepage/AuthenticatedHomepage";

interface UserLeaderboard {
  id: string;
  name: string | null;
  full_name: string | null;
  province: string | null;
  points: number;
  rank: number;
}

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

const BerandaPage = () => {
  const { user } = useUser();
  const [userLeaderboard, setUserLeaderboard] = useState<UserLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);

  // New state for authenticated user data
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [activityHistory, setActivityHistory] = useState<ActivityHistory[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setActivityLoading(true);

        // Fetch user leaderboard
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

        // Fetch daily challenge
        const challengeResponse = await fetch("/api/daily-challenge");
        if (challengeResponse.ok) {
          const challengeResult = await challengeResponse.json();
          if (challengeResult.success && challengeResult.data) {
            setDailyChallenges(Array.isArray(challengeResult.data) ? challengeResult.data : [challengeResult.data]);
          }
        }

        // Fetch activity history (last 3 activities for homepage)
        const activityResponse = await fetch("/api/activities?limit=3");
        if (activityResponse.ok) {
          const activityResult = await activityResponse.json();
          if (activityResult.success && activityResult.data) {
            setActivityHistory(activityResult.data.activities || activityResult.data || []);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setActivityLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <AuthenticatedHomepage
      dailyChallenges={dailyChallenges}
      activityHistory={activityHistory}
      activityLoading={activityLoading}
      userName={user?.firstName || user?.fullName || undefined}
    />
  )
}

export default BerandaPage
