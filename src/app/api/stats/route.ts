import { NextRequest, NextResponse } from 'next/server'
import { calculateStats } from '@/lib/calculate-stats'

export async function GET(request: NextRequest) {
  try {
    const stats = await calculateStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in stats API:', error)
    return NextResponse.json(
      {
        totalUsers: 0,
        totalActivities: 0,
        activeProvinces: 0,
        error: 'Failed to calculate stats'
      },
      { status: 500 }
    )
  }
}
