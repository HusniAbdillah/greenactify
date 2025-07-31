import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { deleteActivityAndDecrementPoints, supabase } from '@/lib/supabase-client';
import { getProfileIdByClerkId } from '@/lib/get-profile'; 

export async function DELETE(
  req: Request,
  context: any
) {
  const { id } = context.params;

  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const activityId = id; // Extracting activityId from the dynamic route segment

  if (!activityId || typeof activityId !== 'string') {
    return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 });
  }

  try {
    const userProfileId = await getProfileIdByClerkId(clerkId);
    if (!userProfileId) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const { data: activityOwnerData, error: ownerError } = await supabase
        .from('activities')
        .select('user_id')
        .eq('id', activityId)
        .single();

    if (ownerError || !activityOwnerData || activityOwnerData.user_id !== userProfileId) {
        return NextResponse.json({ error: 'Not authorized to delete this activity' }, { status: 403 });
    }

    const success = await deleteActivityAndDecrementPoints(activityId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete activity or update points' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Activity deleted and points updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('API Error deleting activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}