import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase-client'
import { getProfileIdByClerkId } from '@/lib/get-profile'

export async function PUT(req: Request) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profileId = await getProfileIdByClerkId(clerkId)
  if (!profileId) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const body = await req.json()
  const { id, title, location_name, image_url } = body

  if (!id) return NextResponse.json({ error: 'Missing activity ID' }, { status: 400 })

  const { error } = await supabase
    .from('activities')
    .update({
      title,
      location_name,
      image_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', profileId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
