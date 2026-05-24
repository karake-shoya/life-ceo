'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/cached'

export async function updateDisplayName(name: string): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: '認証エラーが発生しました' }

  const trimmed = name.trim()
  if (!trimmed) return { error: '表示名を入力してください' }
  if (trimmed.length > 50) return { error: '表示名は50文字以内にしてください' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: trimmed })
    .eq('id', user.id)

  if (error) {
    console.error('[updateDisplayName]', error.message)
    return { error: 'プロフィールの更新に失敗しました' }
  }

  return {}
}
