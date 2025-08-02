import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const { count, error } = await supabase()
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    if (error) {
      console.error('Error counting activities:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      totalActivities: count || 0,
      success: true
    })

  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      success: false
    }, { status: 500 })
  }
}
