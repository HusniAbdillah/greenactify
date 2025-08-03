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
      .select('*')
      .eq('id', activityId)
      .single();

    if (fetchError || !activity || activity.user_id !== userProfileId) {
      return NextResponse.json({ error: 'Not authorized to delete this activity' }, { status: 403 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_activities, points')
      .eq('id', userProfileId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const newTotalActivities = Math.max((profile.total_activities || 0) - 1, 0);
    const newPoints = Math.max((profile.points || 0) - activity.points, 0);

    const { error: deleteError } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 });
    }

    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        total_activities: newTotalActivities,
        points: newPoints,
      })
      .eq('id', userProfileId);

    if (updateProfileError) {
      console.error('Profile update error:', updateProfileError);
      const { error: rollbackError } = await supabase
        .from('activities')
        .insert(activity);
      
      if (rollbackError) {
        console.error('Rollback insert failed:', rollbackError);
      }
      
      return NextResponse.json({ 
        error: 'Failed to update profile data',
        details: updateProfileError.message || updateProfileError 
      }, { status: 500 });
    }

    if (activity.province) {
      const { data: provinceStat, error: provinceStatError } = await supabase
        .from('province_stats')
        .select('total_activities, total_points, total_users')
        .eq('province', activity.province)
        .maybeSingle();

      if (!provinceStatError && provinceStat) {
        const newTotalActivitiesProvince = Math.max(provinceStat.total_activities - 1, 0);
        const newTotalPointsProvince = Math.max(provinceStat.total_points - activity.points, 0);
        const avgPointsPerUser = provinceStat.total_users === 0 ? 0 : Math.floor(newTotalPointsProvince / provinceStat.total_users);

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
          console.error('Province update error details:', updateProvinceError);
          console.error('Attempting to update province:', activity.province);
          console.error('Province stat data:', provinceStat);
          console.error('New values:', { newTotalActivitiesProvince, newTotalPointsProvince, avgPointsPerUser });
          
          const { error: profileRollbackError } = await supabase
            .from('profiles')
            .update({
              total_activities: profile.total_activities,
              points: profile.points,
            })
            .eq('id', userProfileId);

          if (profileRollbackError) {
            console.error('Profile rollback failed:', profileRollbackError);
          }

          const { error: activityRollbackError } = await supabase
            .from('activities')
            .insert(activity);

          if (activityRollbackError) {
            console.error('Activity rollback failed:', activityRollbackError);
          }

          return NextResponse.json({ 
            error: 'Failed to update province stats', 
            details: updateProvinceError.message || updateProvinceError 
          }, { status: 500 });
        }
      }
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
      try {
        await supabase.storage.from(bucket).remove([path]);
      } catch (imageError) {
        console.error(`Failed to delete image from ${bucket}/${path}:`, imageError);
      }
    }

    return NextResponse.json({ 
      message: 'Activity deleted successfully' 
    }, { status: 200 });

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