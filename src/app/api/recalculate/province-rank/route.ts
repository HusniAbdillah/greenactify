import { NextResponse } from 'next/server';
import { recalculateProvinceRanks } from '@/lib/supabase-client';

export async function POST() {
  const result = await recalculateProvinceRanks();

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ message: 'Province ranks recalculated', ...result });
}
