import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const { data: users, error } = await supabase()
      .from('profiles')
      .select('*')
      .order('points', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const usersWithRank = users.map((user, index) => ({
      ...user,
      rank: index + 1
    }))

    return NextResponse.json({ users: usersWithRank })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
