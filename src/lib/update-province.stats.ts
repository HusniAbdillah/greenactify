import { supabase } from '@/lib/supabase-client'

export async function updateProvinceStats(province: string, points: number) {
  const { data: provinceStat, error: fetchError } = await supabase
    .from('province_stats')
    .select('total_points')
    .eq('province', province)
    .single()
  if (fetchError) throw fetchError

  const newTotalPoints = (provinceStat?.total_points ?? 0) + points

  const { data, error } = await supabase
    .from('province_stats')
    .update({ total_points: newTotalPoints })
    .eq('province', province)
  if (error) throw error
  return data
}