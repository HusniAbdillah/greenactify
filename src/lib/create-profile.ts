import { supabase } from '@/lib/supabase-client'

export async function createProfileForClerkUser(clerkId: string, name: string) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ clerk_id: clerkId, name }])
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}