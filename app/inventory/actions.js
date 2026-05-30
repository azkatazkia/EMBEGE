'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function getItems() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not logged in' }

  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .single()

  if (!member) return { data: null, error: 'No household found' }

  const { data: items, error } = await supabase
    .from('food_items')
    .select('*')
    .eq('household_id', member.household_id)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }

  const { data: members } = await supabase
    .from('household_members')
    .select('user_id, display_name')
    .eq('household_id', member.household_id)

  const memberMap = Object.fromEntries(
    (members ?? []).map(m => [m.user_id, m.display_name])
  )

  const data = items.map(item => ({
    ...item,
    added_by_name: memberMap[item.added_by] ?? 'Someone',
  }))

  return { data, error: null }
}

export async function addItem(formData) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .single()

  if (!member) return { error: 'No household found' }

  const { error } = await supabase
    .from('food_items')
    .insert({
      household_id: member.household_id,
      name: formData.get('name'),
      quantity: formData.get('quantity'),
      expiry_date: formData.get('expiry_date'),
      storage_location: formData.get('storage_location'),
      added_by: user.id,
    })

  return { error: error?.message ?? null }
}

export async function deleteItem(id) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('food_items')
    .delete()
    .eq('id', id)

  return { error: error?.message ?? null }
}
