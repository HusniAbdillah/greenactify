import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getProfileByProfileId } from '@/lib/supabase-client';
import { getProfileIdByClerkId } from '@/lib/get-profile'; 

export async function GET() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profileUuid = await getProfileIdByClerkId(clerkId);
    
    if (!profileUuid) {
      return NextResponse.json({ error: 'Profile ID not found for this Clerk user' }, { status: 404 });
    }

    const userProfileData = await getProfileByProfileId(profileUuid);

    if (!userProfileData) {
      return NextResponse.json({ error: 'User profile data not found in database' }, { status: 404 });
    }

    return NextResponse.json(userProfileData);

  } catch (error) {
    console.error('API Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}