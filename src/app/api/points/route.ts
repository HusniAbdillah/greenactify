import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getProfileIdByClerkId } from '@/lib/get-profile';
import { recalculateAllUserPoints } from '@/lib/supabase-client';

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profileId = await getProfileIdByClerkId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const result = await recalculateAllUserPoints();

  if (!result.success) {
    return NextResponse.json({ error: 'Failed to recalculate points' }, { status: 500 });
  }

  return NextResponse.json({
    message: 'Points & leaderboard updated',
    updatedUsers: result.updated,
    failedUpdates: result.failed,
  });
}
