import { supabase } from './supabase-client'

export interface StatsData {
  totalUsers: number
  totalActivities: number
  activeProvinces: number
}

export async function calculateStats(): Promise<StatsData> {
  try {
    // Get total activities from province_stats table
    const { data: provinceStats, error: provinceError } = await supabase
      .from('province_stats')
      .select('total_activities, total_users')

    if (provinceError) {
      console.error('Error fetching province stats:', provinceError)
      return { totalUsers: 0, totalActivities: 0, activeProvinces: 0 }
    }

    // Calculate total activities (sum of all total_activities)
    const totalActivities = provinceStats?.reduce((sum, province) => {
      return sum + (province.total_activities || 0)
    }, 0) || 0

    // Calculate total users (sum of all total_users)
    const totalUsers = provinceStats?.reduce((sum, province) => {
      return sum + (province.total_users || 0)
    }, 0) || 0

    // Calculate active provinces (provinces with total_activities > 0)
    const activeProvinces = provinceStats?.filter(province =>
      (province.total_activities || 0) > 0
    ).length || 0

    return {
      totalUsers,
      totalActivities,
      activeProvinces
    }
  } catch (error) {
    console.error('Error calculating stats:', error)
    return { totalUsers: 0, totalActivities: 0, activeProvinces: 0 }
  }
}

export async function fetchStats(): Promise<StatsData> {
  try {
    const response = await fetch('/api/stats')
    if (!response.ok) {
      throw new Error('Failed to fetch stats')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { totalUsers: 0, totalActivities: 0, activeProvinces: 0 }
  }
}
