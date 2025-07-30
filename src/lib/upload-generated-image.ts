import { supabase } from '@/lib/supabase-client'

export async function uploadGeneratedImage(dataUrl: string, path: string) {
  // Convert base64 dataURL to Blob
  const res = await fetch(dataUrl);
  const blob = await res.blob();

  const { data, error } = await supabase.storage
    .from('activity-images')
    .upload(path, blob, { contentType: 'image/png' });
  if (error) throw error;

  const { publicUrl } = supabase.storage
    .from('activity-images')
    .getPublicUrl(data.path).data;
  return publicUrl;
}