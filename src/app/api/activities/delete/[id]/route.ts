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
      .select('user_id, image_url, generated_image_url, points, province')
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


    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_activities, points')
      .eq('id', userProfileId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const newTotalActivities = (profile.total_activities || 0) - 1;
    const newPoints = (profile.points || 0) - activity.points;

    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        total_activities: newTotalActivities,
        points: newPoints,
      })
      .eq('id', userProfileId);

    if (updateProfileError) {
      return NextResponse.json({ error: 'Failed to update profile data' }, { status: 500 });
    }

    if (activity.province) {
      const { data: provinceStat, error: provinceStatError } = await supabase
        .from('province_stats')
        .select('total_activities, total_points, total_users')
        .eq('province', activity.province)
        .single();

      if (!provinceStatError && provinceStat) {
        const newTotalActivitiesProvince = provinceStat.total_activities - 1;
        const newTotalPointsProvince = provinceStat.total_points - activity.points;
        const avgPointsPerUser =
          provinceStat.total_users === 0 ? 0 : newTotalPointsProvince / provinceStat.total_users;

        const { error: updateProvinceError } = await supabase
          .from('province_stats')
          .update({
            total_activities: newTotalActivitiesProvince,
            total_points: newTotalPointsProvince,
            avg_points_per_user: avgPointsPerUser,
            updated_at: new Date().toISOString(),
          })
          .eq('province', activity.province);

        if (updateProvinceError) {
          return NextResponse.json({ error: 'Failed to update province stats' }, { status: 500 });
        }
      }
    }


    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Activity, images, profile, and province stats updated and deleted successfully' }, { status: 200 });

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
