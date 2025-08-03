// src/lib/createActivity.ts
import { supabase } from '@/lib/supabase-client'

export async function createActivity(payload: {
  user_id: string,
  category_id: string,
  title: string,
  description?: string,
  points: number,
  image_url: string,
  generated_image_url: string,
  latitude: number,
  longitude: number,
  province: string,
  is_shared?: boolean,
  challenge_id?: string // Add challenge_id
}) {
  const { data, error } = await supabase
    .from('activities')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}