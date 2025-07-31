// app/api/activities/[id]/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } } 
) {
  const profileId = params.id; // UUID user

  if (!profileId) {
    return NextResponse.json(
      { error: 'Profile ID is required' },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from('activities')
          .select(`
      id,
      user_id,
      category_id,
      title,
      description,
      image_url,
      location_name,
      latitude,
      longitude,
      province,
      city,
      status,
      verified_by,
      verified_at,
      is_shared,
      share_count,
      like_count,
      metadata,
      created_at,
      updated_at,
      points,
      activity_categories (
        name,
        base_points,
        group_category
      )
    `)
      .eq('user_id', profileId)
      .order('created_at', { ascending: false }); // opsional

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
