import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')

    let query = supabase()
      .from('province_stats')
      .select('*')

    query = query.limit(limit ? parseInt(limit) : 50)

    const { data: provinces, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: provinces || [],
      count: provinces?.length || 0,
      success: true
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      success: false
    }, { status: 500 })
  }
}
