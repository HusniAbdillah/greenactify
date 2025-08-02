// src/lib/get-activities.ts
import { supabase } from '@/lib/supabase-client'

// Get all activity categories with group info from group_category column
export async function getActivityCategories() {
  const { data, error } = await supabase
    .from('activity_categories')
    .select('id, name, description, icon, base_points, color, image_url, group_category')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

// Get all activity groups for filtering
export async function getActivityGroups() {
  const { data, error } = await supabase
    .from('activity_group')
    .select('id, name, icon, description')
  if (error) throw error
  return data
}

// Get categories with group_category for SelectActivityStep component
export async function getActivityCategoriesWithGroups() {
  const { data, error } = await supabase
    .from('activity_categories')
    .select('id, name, base_points, description, group_category')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}