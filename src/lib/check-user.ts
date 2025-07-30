import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from './supabase-admin'; 

export const checkUser = async () => {
  try {
    const user = await currentUser();
    if (!user) return null;

    // 1. Cek apakah profil sudah ada
    const { data: existing, error } = await supabaseAdmin
      .from('profiles')
      .select('*') // Ambil semua kolom
      .eq('clerk_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (existing) return existing;

    // 2. Buat profil baru jika belum ada
    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        clerk_id: user.id,
        email: user.emailAddresses[0].emailAddress,
        full_name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null,
        username: user.username || user.id.slice(0, 8),
        avatar_url: user.imageUrl,
        points: 0,
        level: 0,
        total_activities: 0,
      })
      .select()
      .single();

    if (insertError) throw new Error(`Insert failed: ${insertError.message}`);

    return newProfile;
  } catch (err) {
    console.error('❌ checkUser error:', err);
    return null;
  }
};