import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Optimasi: Select hanya field yang dibutuhkan
    const { data: challenge, error } = await supabase
      .from('daily_challenges')
      .select(`
        id,
        title,
        description,
        icon,
        double_points,
        category_id,
        difficulty,
        date,
        instructions,
        is_active,
        activity_group!inner (
          id,
          name,
          icon,
          description
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching challenge by ID:', error);
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Minimal transformation - langsung return format yang sesuai
    return NextResponse.json({
      success: true,
      data: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        icon: challenge.icon || '🌱',
        double_points: challenge.double_points || 50,
        category_id: challenge.category_id,
        difficulty: challenge.difficulty || 'medium',
        date: challenge.date,
        instructions: challenge.instructions,
        is_active: challenge.is_active,
        activity_group: challenge.activity_group
      }
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}