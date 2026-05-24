'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/review', label: '月次レビュー', icon: BookOpen },
  { href: '/settings', label: '設定', icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              active
                ? 'bg-green-50 font-medium text-green-800'
                : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </div>
  )
}
