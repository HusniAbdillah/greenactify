import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET( request: Request) {

  try {
    const { data, error } = await supabase
      .from('activities')
          .select(`
        *,
      activity_categories (
        name,
        base_points,
        group_category
      )
    `)


    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ALl activities' },
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
