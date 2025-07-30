
import { NextResponse } from 'next/server';
import { refreshProvinceStats } from '@/lib/supabase-client';

export async function GET() {
  const result = await refreshProvinceStats();

  return NextResponse.json(result);
}
