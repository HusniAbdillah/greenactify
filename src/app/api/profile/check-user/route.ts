import { NextResponse } from 'next/server'
import { checkUser } from '@/lib/check-user'

export async function POST() {
  const user = await checkUser()

  if (!user) {
    return NextResponse.json({ error: 'User not found or unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ user })
}
