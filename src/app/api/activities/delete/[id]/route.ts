import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase-client';
import { NextResponse } from 'next/server';
import { getProfileIdByClerkId } from '@/lib/get-profile';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profileId = await getProfileIdByClerkId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const { id } = params;

  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id)
    .eq('user_id', profileId); // Supaya hanya bisa hapus milik sendiri

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
