export interface DailyChallenge {
  id: number;
  title: string;
  description: string;
  icon: string;
  points: number;
  double_points: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expires_at: Date;
  instructions: string[];
  tips: string;
  hoursRemaining?: number;
  isActive?: boolean;
}

export interface ActivityHistory {
  id: number;
  userId: string;
  type: string;
  description: string;
  points: number;
  date: Date;
  status: 'completed' | 'pending' | 'rejected';
  category: string;
  location: string;
  image_url: string;
  verified: boolean;
  challenge_id: number | null;
  relativeTime?: string;
  categoryColor?: string;
}

export interface ActivitySummary {
  totalActivities: number;
  totalPoints: number;
  completedActivities: number;
  pendingActivities: number;
}

export interface ActivityHistoryResponse {
  activities: ActivityHistory[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  summary: ActivitySummary;
}

export interface UserStats {
  totalPoints: number;
  completedActivities: number;
  nationalRank: number;
  streakDays: number;
  currentChallenge?: DailyChallenge;
  recentActivities?: ActivityHistory[];
}
