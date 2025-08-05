import { getDetailedActivitiesByUserId } from '@/lib/supabase-client'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getProfileIdByClerkId } from '@/lib/get-profile'

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Fetching fresh activities for clerk_id:', clerkId)

    const profileId = await getProfileIdByClerkId(clerkId)

    if (!profileId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const data = await getDetailedActivitiesByUserId(profileId)

    console.log('✅ Fresh activities returned:', data?.length || 0)

    // Headers untuk tidak cache sama sekali
    const response = NextResponse.json(data || [])
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Last-Modified', new Date().toUTCString())

    return response
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
