import { supabase } from '@/lib/supabase-client'

export async function getProvinces() {
  const { data, error } = await supabase
    .from('province_stats')
    .select('province, coordinates')
    .order('rank', { ascending: true })
  if (error) throw error
  return data
}