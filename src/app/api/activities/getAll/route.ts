import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        activity_categories (
          name,
          base_points,
          group_category
        )
      `)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({
        loading: false,
        error: 'Gagal mengambil data aktivitas',
        data: null
      }, { status: 500 })
    }

    return NextResponse.json({
      loading: false,
      error: null,
      data
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({
      loading: false,
      error: 'Terjadi kesalahan server',
      data: null
    }, { status: 500 })
  }
}
