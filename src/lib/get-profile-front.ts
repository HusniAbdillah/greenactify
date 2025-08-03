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

// 🔧 Tambah debugging yang lebih detail
export const getProfileByClerkId = async (clerkId: string) => {
  console.log('🔍 Getting profile for clerk_id:', clerkId)
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, points, total_activities, rank, username')
    .eq('clerk_id', clerkId)
    .single()

  console.log('📊 Supabase response:', { data, error })

  if (error) {
    console.error('❌ Error fetching profile:', error)
    
    // 🔧 Coba query tanpa filter untuk debug
    console.log('🔧 Trying to fetch all profiles to debug...')
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, clerk_id, username, rank')
      .limit(5)
    
    console.log('📋 Sample profiles:', allProfiles)
    console.log('❌ All profiles error:', allError)
    
    return null
  }

  console.log('✅ Profile data retrieved:', data)
  
  // 🔧 Cek apakah rank ada dan valid
  if (data) {
    console.log('🎯 Rank value:', data.rank, typeof data.rank)
  }
  
  return data
}