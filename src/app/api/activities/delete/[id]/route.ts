import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { getProfileIdByClerkId } from '@/lib/get-profile';

export async function DELETE(req: Request, context: any) {
  const { id: activityId } = context.params;

  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!activityId || typeof activityId !== 'string') {
    return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 });
  }

  try {
    const userProfileId = await getProfileIdByClerkId(clerkId);
    if (!userProfileId) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const { data: activity, error: fetchError } = await supabase
      .from('activities')
      .select('user_id, image_url, generated_image_url')
      .eq('id', activityId)
      .single();

    if (fetchError || !activity || activity.user_id !== userProfileId) {
      return NextResponse.json({ error: 'Not authorized to delete this activity' }, { status: 403 });
    }


    const toDelete: { bucket: string; path: string }[] = [];

    if (activity.image_url) {
      const imagePath = extractPathFromUrl(activity.image_url);
      if (imagePath) toDelete.push({ bucket: 'user-uploads', path: imagePath });
    }

    if (activity.generated_image_url) {
      const generatedPath = extractPathFromUrl(activity.generated_image_url);
      if (generatedPath) toDelete.push({ bucket: 'generated-images', path: generatedPath });
    }

    for (const { bucket, path } of toDelete) {
      await supabase.storage.from(bucket).remove([path]);
    }

    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Activity and images deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('API Error deleting activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


function extractPathFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/');
    const bucketIndex = parts.findIndex((p) => p === 'object');
    if (bucketIndex === -1 || bucketIndex + 2 >= parts.length) return null;
    return parts.slice(bucketIndex + 2).join('/');
  } catch {
    return null;
  }
}
