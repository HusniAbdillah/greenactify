import { supabase } from "./supabase-admin"
// lib/supabase/getProfileIdByClerkId.ts


export const getProfileIdByClerkId = async (clerkId: string): Promise<string | null> => {
  const client = supabase()
  const { data, error } = await client
    .from('profiles')
    .select('id')
    .eq('clerk_id', clerkId)
    .single()

  if (error) {
    console.error('❌ Error fetching profile ID:', error)
    return null
  }

  return data.id
}



export const getActivityGroupCounts = async (profileId: string) => {
  const client = supabase()
  const { data, error } = await client.rpc('get_activity_group_counts', {
    user_profile_id: profileId
  })

  if (error) {
    console.error('❌ Error fetching activity group counts:', error)
    return []
  }

  return data
}
