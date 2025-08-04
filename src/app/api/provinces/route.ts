import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-admin'
import { getCachedData, setCachedData } from '@/lib/api-cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const orderBy = searchParams.get('orderBy') || 'total_points'
    const orderDirection = searchParams.get('orderDirection') || 'desc'
    const cacheKey = `provinces-${limit || 'all'}`
    
    const cached = getCachedData(cacheKey, 3600000);
    if (cached) {
      return NextResponse.json(cached);
    }

    let query = supabase()
      .from('province_stats')
      .select('*')
      .order(orderBy, { ascending: orderDirection === 'asc' })

    if (limit) {
      query = query.limit(parseInt(limit))
    } else {
      query = query.limit(50)
    }

    const { data: provinces, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const provincesWithRank = provinces?.map((province, index) => ({
      ...province,
      rank: index + 1
    }))

    const result = {
      data: provincesWithRank || [],
      count: provincesWithRank?.length || 0,
      success: true
    };

    setCachedData(cacheKey, result);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      success: false
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authData = await auth()
    const userId = authData?.userId

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase()
      .from('provinces')
      .insert(body)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: data,
      success: true
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      success: false
    }, { status: 500 })
  }
}
