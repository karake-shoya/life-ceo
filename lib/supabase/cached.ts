import { cache } from 'react'
import { createClient } from './server'
import { Profile } from '@/types/database'

// React cache でリクエスト内の重複呼び出しを排除する
// layout と各ページが同じ getUser / getProfile を呼んでも DB アクセスは1回のみ

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

type ProfileSubset = Pick<Profile, 'plan' | 'display_name' | 'trial_ends_at'>

export const getProfile = cache(async (userId: string): Promise<ProfileSubset | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('plan, display_name, trial_ends_at')
    .eq('id', userId)
    .single()
  if (error) {
    console.error('[getProfile]', error.message)
    return null
  }
  return data as ProfileSubset | null
})
