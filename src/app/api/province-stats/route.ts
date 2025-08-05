import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const { count: totalUsers, error: usersError } = await supabase()
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    const { data: provinceStats, error } = await supabase()
      .from('province_stats')
      .select('*')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const statsFromProvinces = provinceStats?.reduce((acc, province) => ({
      totalActivities: acc.totalActivities + (province.total_activities || 0),
      totalPoints: acc.totalPoints + (province.total_points || 0),
      activeProvinces: acc.activeProvinces + ((province.total_users > 0 || province.total_activities > 0) ? 1 : 0)
    }), {
      totalActivities: 0,
      totalPoints: 0,
      activeProvinces: 0
    }) || {
      totalActivities: 0,
      totalPoints: 0,
      activeProvinces: 0
    }

    const totals = {
      totalUsers: totalUsers || 0, 
      totalActivities: statsFromProvinces.totalActivities,
      totalPoints: statsFromProvinces.totalPoints, 
      activeProvinces: statsFromProvinces.activeProvinces
    }

    return NextResponse.json({
      data: totals,
      success: true
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      success: false
    }, { status: 500 })
  }
}