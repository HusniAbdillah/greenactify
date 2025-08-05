import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getProfileByClerkId2 } from '@/lib/supabase-client';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await getProfileByClerkId2(clerkId);
    
    if (!userProfile) {
      return NextResponse.json({ 
        error: 'Profile not found for this user' 
      }, { status: 404 });
    }

    return NextResponse.json(userProfile);
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}