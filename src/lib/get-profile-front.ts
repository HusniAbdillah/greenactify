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

export const getProfileByClerkId = async (clerkId: string) => {
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, points, total_activities, rank, username')
    .eq('clerk_id', clerkId)
    .single()


  if (error) {
    console.error('❌ Error fetching profile:', error)
    
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, clerk_id, username, rank')
      .limit(5)
    
    
    return null
  }

  return data
}