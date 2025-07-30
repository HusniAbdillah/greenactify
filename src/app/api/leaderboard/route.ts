import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'users'

    let data

    if (type === 'provinces') {
      // Fetch provinces leaderboard
      const { data: provinces, error } = await supabase()
        .from('leaderboard_provinces')
        .select('*')

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      data = provinces
    } else {
      // Fetch users leaderboard (default)
      const { data: users, error } = await supabase()
        .from('leaderboard_users')
        .select('*')

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      data = users
    }

    return NextResponse.json({
      data: data || [],
      type: type,
      count: data?.length || 0
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
