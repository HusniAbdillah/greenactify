import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getProfileByClerkId2 } from '@/lib/supabase-client';

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (requestedUserId && requestedUserId !== clerkId) {
      console.error('Profile access denied:', { 
        authenticated: clerkId, 
        requested: requestedUserId 
      });
      return NextResponse.json({ 
        error: 'Access denied - can only access your own profile' 
      }, { status: 403 });
    }

    const userProfile = await getProfileByClerkId2(clerkId);
    
    if (!userProfile) {
      return NextResponse.json({ 
        error: 'Profile not found for this user' 
      }, { status: 404 });
    }

    if (userProfile.clerk_id !== clerkId) {
      console.error('Profile mismatch:', { 
        expected: clerkId, 
        got: userProfile.clerk_id 
      });
      return NextResponse.json({ 
        error: 'Profile data mismatch' 
      }, { status: 500 });
    }

    const response = NextResponse.json(userProfile);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}