import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const { data: provinceStats, error: provinceError } = await supabase()
      .from('province_stats')
      .select('total_points')

    if (provinceError) {
      console.error('Error fetching province stats:', provinceError)
      return NextResponse.json({ error: provinceError.message }, { status: 500 })
    }

    const totalPoints = provinceStats?.reduce((sum, province) => sum + (province.total_points || 0), 0) || 0

    const activeRegions = provinceStats?.filter(province => (province.total_points || 0) > 0).length || 0

    return NextResponse.json({
      totalPoints,
      activeRegions,
      success: true
    })

  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      success: false
    }, { status: 500 })
  }
}
