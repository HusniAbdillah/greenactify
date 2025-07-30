
import { NextResponse } from 'next/server';
import { reassignProfileRanks } from '@/lib/supabase-client';

export async function GET() {
  const result = await reassignProfileRanks();
  return NextResponse.json(result);
}
