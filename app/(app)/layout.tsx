import { redirect } from 'next/navigation'
import { getCurrentUser, getProfile } from '@/lib/supabase/cached'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  const plan = profile?.plan ?? 'free'
  const displayName = profile?.display_name ?? user.email ?? 'ユーザー'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* デスクトップサイドバー */}
      <aside className="fixed inset-y-0 left-0 hidden w-56 flex-col border-r border-stone-200 bg-white md:flex">
        {/* ロゴ */}
        <div className="flex h-16 items-center gap-2.5 border-b border-stone-100 px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-green-800">
            <span className="text-[11px] font-bold text-white">LC</span>
          </div>
          <span className="font-semibold tracking-tight text-stone-900">LifeCEO</span>
        </div>

        {/* ナビ */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav />
        </div>

        {/* ユーザー / プラン */}
        <div className="border-t border-stone-100 p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-800">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-stone-700">{displayName}</p>
              <span
                className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  plan === 'pro'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-stone-100 text-stone-500'
                }`}
              >
                {plan}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* モバイルトップバー */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-stone-200 bg-white px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-green-800">
            <span className="text-[10px] font-bold text-white">LC</span>
          </div>
          <span className="text-sm font-semibold text-stone-900">LifeCEO</span>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-800">
          {initial}
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="flex-1 md:ml-56">
        <div className="pb-24 pt-14 md:pb-8 md:pt-0">
          {children}
        </div>
      </main>

      {/* モバイルボトムナビ（aside 外に配置して display:none の影響を受けないようにする） */}
      <MobileBottomNav />
    </div>
  )
}
