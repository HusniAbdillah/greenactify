import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from './supabase-admin'; 

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  console.log('🟢 User found:', user.id);

  const { data: existing, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('clerk_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('❌ Error checking existing profile:', error);
    return null;
  }

  if (existing) {
    console.log('✅ User already exists');
    return existing;
  }

  const { data: newProfile, error: insertError } = await supabaseAdmin
    .from('profiles')
    .insert({
      clerk_id: user.id,
      email: user.emailAddresses[0].emailAddress,
      full_name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      username: user.username || user.id,
      avatar_url: user.imageUrl,
      points: 0,
      level: 0,
      onboarding_completed: false,
      total_activities: 0,
    });

  if (insertError) {
    console.error('❌ Error inserting user:', insertError);
    return null;
  }

  console.log('✅ New user inserted');
  return newProfile;
};
