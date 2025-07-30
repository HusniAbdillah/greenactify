import { supabase } from '@/lib/supabase-client'

export const getProfileIdByClerkId = async (clerkId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_id', clerkId)
    .single()

  if (error) {
    console.error('❌ Error fetching profile ID:', error)
    return null
  }

  return data?.id ?? null
}