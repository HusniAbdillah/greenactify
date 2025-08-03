// src/lib/updateUserPoints.ts

import { supabase } from '@/lib/supabase-client'

export async function updateUserPoints(user_id: string, points: number) {
  console.log("🎯 updateUserPoints called with:", { user_id, points });
  
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', user_id)
    .single()
    
  console.log("📊 Current profile points:", profile?.points);
  
  const newPoints = (profile?.points ?? 0) + points
  console.log("🔢 New points will be:", newPoints);
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ points: newPoints })
    .eq('id', user_id)
    
  console.log("✅ Update completed");
  return data
}