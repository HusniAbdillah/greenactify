// src/lib/updateProvinceStats.ts

import { supabase } from '@/lib/supabase-client'

export async function updateProvinceStats(province: string, points: number) {
  // 1. Fetch current total_points
  const { data: provinceStat, error: fetchError } = await supabase
    .from('province_stats')
    .select('total_points')
    .eq('province', province)
    .single()
  if (fetchError) throw fetchError

  // 2. Calculate new total_points
  const newTotalPoints = (provinceStat?.total_points ?? 0) + points

  // 3. Update total_points
  const { data, error } = await supabase
    .from('province_stats')
    .update({ total_points: newTotalPoints })
    .eq('province', province)
  if (error) throw error
  return data
}