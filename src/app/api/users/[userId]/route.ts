import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: authUserId } = await auth();
    
    if (!authUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        username,
        avatar_url,
        points,
        province,
        total_activities,
        created_at,
        rank,
        clerk_id
      `)
      .or(`id.eq.${userId},clerk_id.eq.${userId}`)
      .single();

    if (error || !profile) {
      return NextResponse.json({ 
        error: 'Profile not found',
        details: error?.message 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: profile
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
