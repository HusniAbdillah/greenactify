import { getDetailedActivitiesByUserId } from '@/lib/supabase-client'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getProfileIdByClerkId,} from '@/lib/get-profile'

export async function GET(req: Request) {
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profileId = await getProfileIdByClerkId(clerkId)

  if (!profileId) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const data = await getDetailedActivitiesByUserId(profileId)
  return NextResponse.json(data)
}
