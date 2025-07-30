// src/lib/updateUserPoints.ts

import { supabase } from '@/lib/supabase-client'

export async function updateUserPoints(user_id: string, points: number) {
  // 1. Fetch current points
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', user_id)
    .single()
  if (fetchError) throw fetchError

  // 2. Calculate new points
  const newPoints = (profile?.points ?? 0) + points

  // 3. Update points
  const { data, error } = await supabase
    .from('profiles')
    .update({ points: newPoints })
    .eq('id', user_id)
  if (error) throw error
  return data
}