import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const [activitiesResult, categoriesResult] = await Promise.all([
      supabase()
        .from('activities')
        .select('id, category_id')
        .eq('status', 'approved'),
      supabase()
        .from('activity_categories')
        .select('id, name, group_category')
    ])

    if (activitiesResult.error) {
      console.error('Error fetching activities:', activitiesResult.error)
      return NextResponse.json({ error: activitiesResult.error.message }, { status: 500 })
    }

    if (categoriesResult.error) {
      console.error('Error fetching categories:', categoriesResult.error)
      return NextResponse.json({ error: categoriesResult.error.message }, { status: 500 })
    }

    const activities = activitiesResult.data
    const categories = categoriesResult.data

    console.log('Fetched activities count:', activities?.length)
    console.log('Fetched categories count:', categories?.length)

    const categoryMap = new Map()
    categories?.forEach(category => {
      categoryMap.set(category.id, category.name)
    })

    const categoryCount: { [key: string]: number } = {}

    activities?.forEach((activity, index) => {
      const categoryName = categoryMap.get(activity.category_id)
      if (index < 3) {
        console.log(`Activity ${index}:`, {
          id: activity.id,
          category_id: activity.category_id,
          categoryName: categoryName
        })
      }

      if (categoryName) {
        categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1
      }
    })

    console.log('Category counts:', categoryCount)

    const popularActivities = Object.entries(categoryCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / (activities?.length || 1)) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return NextResponse.json({
      popularActivities,
      totalActivities: activities?.length || 0,
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
