'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-1.5 text-[11px] text-stone-400 transition-colors hover:text-red-500 disabled:opacity-50"
      aria-label="ログアウト"
    >
      <LogOut className="h-3.5 w-3.5" />
      ログアウト
    </button>
  )
}
