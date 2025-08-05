// src/lib/updateUserPoints.ts

import { supabase } from '@/lib/supabase-client'

export async function updateUserPoints(user_id: string, points: number) {
  
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', user_id)
    .single()
    
  
  const newPoints = (profile?.points ?? 0) + points
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ points: newPoints })
    .eq('id', user_id)

  return data
}