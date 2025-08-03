
export type Profile = {
  id: string
  email: string
  full_name?: string
  username?: string
  avatar_url?: string
  points: number
  province?: string
  onboarding_completed: boolean
  last_activity_upload?: string
  total_activities: number
  created_at: string
  updated_at: string
  clerk_id?: string
}

export type Activity = {
  id: string
  user_id: string
  category_id: string
  title: string
  description?: string
  points: number
  image_url?: string
  latitude?: number
  longitude?: number
  province?: string
  status: 'pending' | 'approved' | 'rejected'
  verified_by?: string
  verified_at?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export type GroupCategoryType =
  | 'Daur Ulang'
  | 'Bersih-bersih'
  | 'Hemat Energi'
  | 'Edukasi Lingkungan'
  | 'Hemat Air'
  | 'Makanan Organik'
  | 'Transportasi Hijau'
  | 'Penghijauan'

export type ActivityCategory = {
  id: string
  name: string
  description?: string
  icon?: string
  base_points: number
  color: string
  image_url?: string
  is_active: boolean
  sort_order: number
  created_at: string
  group_category?: GroupCategoryType
}


export type ActivityCategoryGroup = {
  id: string
  category_id: string
  group_id: string
  created_at: string
}

export type ActivityGroup = {
  id: string
  name: string
  icon?: string
  description?: string
  created_at: string
}

export type ActivityLike = {
  id: string
  user_id: string
  activity_id: string
  created_at: string
}

export type ChatbotConversation = {
  id: string
  user_id: string
  message: string
  response?: string
  message_type: 'user' | 'bot'
  created_at: string
}

export type DailyChallenge = {
  id: string
  title: string
  description: string
  instructions?: string
  double_points?: number
  date: string
  category_id?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  target_count?: number
  icon?: string
  image_url?: string
  is_active?: boolean
  created_at: string
}

export interface UserChallenge {
  id: string
  user_id: string
  challenge_id: string
  progress: number
  completed: boolean
  completed_at?: string
  activity_id?: string
  created_at: string
  updated_at?: string
}

export type LeaderboardUser = {
  id: string
  full_name?: string
  username?: string
  avatar_url?: string
  points: number
  province?: string
  total_activities: number
  active_days: number
  completed_challenges: number
  avg_activity_points: number
  last_activity?: string
  rank: number
  province_rank: number
}

export type LeaderboardProvince = {
  province: string
  total_users: number
  total_activities: number
  total_points: number
  avg_user_points: number
  active_days: number
  last_activity?: string
  rank: number
}

export type ProvinceStats = {
  id: string
  province: string
  total_users: number
  total_activities: number
  total_points: number
  avg_points_per_user: number
  rank?: number
  coordinates?: Record<string, unknown>
  updated_at: string
}

export type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'achievement'
  is_read: boolean
  action_url?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export type UploadCooldown = {
  id: string
  user_id: string
  last_upload: string
  cooldown_expires: string
}

export type UserFollow = {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export type ActivityFeed = {
  id: string
  title: string
  description?: string
  points: number
  image_url?: string
  province?: string
  created_at: string
  user_name?: string
  username?: string
  user_avatar?: string
  category_name: string
  category_icon?: string
  category_color: string
}

export type RealtimePayload = {
  commit_timestamp: string
  errors: string[]
  eventType: string
  new: Record<string, unknown>
  old: Record<string, unknown>
  schema: string
  table: string
}
