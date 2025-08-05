import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await params;
        
    if (!userId || userId === 'undefined' || userId === 'null') {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID', data: [] },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (profileError || !profile) {
      console.error('❌ Profile lookup error:', profileError);
      return NextResponse.json(
        { success: false, error: 'User profile not found', data: [] },
        { status: 404 }
      );
    }

    const { data: activities, error } = await supabase
      .from('activities')
      .select(`
        id,
        title,
        description,
        points,
        created_at,
        status,
        province,
        user_id,
        category_id,
        image_url,
        challenge_id,
        activity_categories (
          id,
          name,
          group_category,
          icon
        )
      `)
      .eq('user_id', profile.id)
      .in('status', ['approved', 'pending']) 
      .order('created_at', { ascending: false })
      .limit(3); 

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Database query failed', data: [] },
        { status: 500 }
      );
    }


    const transformedActivities = (activities || []).map((activity: any) => ({
      id: activity.id,
      userId: activity.user_id,
      type: activity.title, 
      description: activity.description || 'Tidak ada deskripsi',
      points: activity.points || 0,
      date: activity.created_at, 
      status: activity.status === 'approved' ? 'completed' : 
             activity.status === 'pending' ? 'pending' : 'rejected',
      category: activity.activity_categories?.group_category || activity.activity_categories?.name || 'Umum',
      location: activity.province || 'Lokasi tidak diketahui',
      image_url: activity.image_url || '',
      verified: !!activity.verified_at,
      challenge_id: activity.challenge_id || null,
    }));


    return NextResponse.json({
      success: true,
      data: transformedActivities,
      count: transformedActivities.length
    });

  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', data: [] },
      { status: 500 }
    );
  }
}