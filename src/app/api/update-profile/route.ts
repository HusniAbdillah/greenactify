// app/api/update-profile/route.ts
import { NextResponse } from 'next/server';
import { updateProfile } from '@/lib/supabase-client';

export async function POST(req: Request) {
  const body = await req.json();
  const { full_name, username, province, clerk_id } = body;

  if (!full_name || !username || !province || !clerk_id) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { error } = await updateProfile({ full_name, username, province, clerk_id });

  if (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Profile updated successfully' });
}
