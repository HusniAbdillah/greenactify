import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileId } = await params;

    if (!profileId) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    const { data: activities, error } = await supabase
      .from('activities')
      .select(`
        id,
        user_id,
        category_id,
        title,
        description,
        points,
        image_url,
        latitude,
        longitude,
        province,
        status,
        created_at,
        updated_at,
        generated_image_url,
        activity_categories (
          name,
          base_points,
          group_category
        )
      `)
      .eq('user_id', profileId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch activities', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(activities || []);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
