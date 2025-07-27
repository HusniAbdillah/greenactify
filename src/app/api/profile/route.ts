import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import {
  getProfileIdByClerkId,
  getActivitiesByProfileId,
  getActivityGroupCounts,
} from '@/lib/get-profile'

export async function GET() {
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profileId = await getProfileIdByClerkId(clerkId)

  if (!profileId) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const [activities, groupCounts] = await Promise.all([
    getActivitiesByProfileId(profileId),
    getActivityGroupCounts(profileId),
  ])

  return NextResponse.json({
    profileId,
    activities,
    groupCounts,
  })
}
