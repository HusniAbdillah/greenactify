// src/lib/uploadImage.ts

import { supabase } from '@/lib/supabase-client'

export async function uploadImage(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('activity-images')
    .upload(path, file)
  if (error) throw error

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('activity-images')
    .getPublicUrl(data.path)
  return publicUrlData.publicUrl
}