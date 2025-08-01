// src/lib/getActivities.ts
import { supabase } from '@/lib/supabase-client'

export async function getActivityCategories() {
  const { data, error } = await supabase
    .from('activity_categories')
    .select('id, name, description, icon, base_points, color, image_url, group_category')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

export async function getActivityGroups() {
  const { data, error } = await supabase
    .from('activity_group')
    .select('id, name, icon, description')
  if (error) throw error
  return data
}

export async function getActivityCategoriesWithGroups() {
  const { data, error } = await supabase
    .from('activity_categories')
    .select(`
      id, name, base_points, description,
      activity_category_group (
        group_id
      )
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}