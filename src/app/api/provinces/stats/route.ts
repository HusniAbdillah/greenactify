import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const { data: provinceStats, error } = await supabase()
      .from('province_stats')
      .select('*')
      .order('total_points', { ascending: false })

    if (error) {
      console.error('Error fetching province stats:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const transformedData = provinceStats?.map(province => ({
      id: province.province.toUpperCase().replace(/\s+/g, '_'),
      name: province.province,
      code: province.province.substring(0, 3).toUpperCase(),
      totalPoints: province.total_points || 0,
      totalActivities: province.total_activities || 0,
      participants: province.total_users || 0,
      averagePerUser: province.avg_points_per_user || 0,
      topActivity: 'Aktivitas Hijau',
      coordinates: [0, 0],
      growth: '+0%',
      position: { x: 0, y: 0 },
      rank: province.rank || 0
    })) || []

    console.log('Transformed province data:', transformedData.length, 'provinces')

    return NextResponse.json({
      provinces: transformedData,
      totalProvinces: transformedData.length,
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
