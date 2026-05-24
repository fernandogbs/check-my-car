'use client'

import {
  Compass,
  LayoutGrid,
  List,
  Plus,
  UserRound,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import type { AppNavRole } from '@/lib/app/app-nav-role-types'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

type NavLabelKey =
  | 'dashboard'
  | 'newRequest'
  | 'explore'
  | 'activities'
  | 'profile'

type NavItemConfig = {
  href: string
  labelKey: NavLabelKey
  match: (path: string) => boolean
  Icon: typeof LayoutGrid
}

const buyerItems: readonly NavItemConfig[] = [
  {
    href: '/dashboard',
    labelKey: 'dashboard',
    match: (path) => path === '/dashboard' || path.startsWith('/dashboard/'),
    Icon: LayoutGrid,
  },
  {
    href: '/requests/new',
    labelKey: 'newRequest',
    match: (path) =>
      path.startsWith('/requests/new') || path.startsWith('/requests/'),
    Icon: Plus,
  },
  {
    href: '/profile',
    labelKey: 'profile',
    match: (path) => path.startsWith('/profile'),
    Icon: UserRound,
  },
]

const inspectorItems: readonly NavItemConfig[] = [
  {
    href: '/dashboard',
    labelKey: 'dashboard',
    match: (path) => path === '/dashboard' || path.startsWith('/dashboard/'),
    Icon: LayoutGrid,
  },
  {
    href: '/explore',
    labelKey: 'explore',
    match: (path) => path.startsWith('/explore'),
    Icon: Compass,
  },
  {
    href: '/activities',
    labelKey: 'activities',
    match: (path) => path.startsWith('/activities'),
    Icon: List,
  },
]

type BottomNavProps = {
  role: AppNavRole
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname()
  const t = useTranslations('Nav')
  const items = role === 'buyer' ? buyerItems : inspectorItems

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-30 rounded-t-3xl bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_-8px_rgb(0_0_0_/12%)] dark:bg-card"
    >
      <ul className="mx-auto flex w-full max-w-2xl items-stretch justify-around gap-1 px-3 pt-2 sm:px-6">
        {items.map(({ href, labelKey, match, Icon }) => {
          const active = match(pathname)
          return (
            <li key={href} className="flex min-w-0 flex-1 justify-center">
              <Link
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex w-full max-w-[7.5rem] flex-col items-center justify-center gap-1 rounded-[22px] px-2 py-2 text-[0.6875rem] font-medium leading-tight transition-colors sm:text-xs',
                  active
                    ? 'bg-[#0055FF] text-white shadow-[0_10px_28px_-16px_rgb(0_85_255_/55%)]'
                    : 'text-[#5c6570] hover:bg-black/[0.04] hover:text-[#2c3f5c] dark:text-muted-foreground dark:hover:bg-white/[0.06]'
                )}
                href={href}
              >
                <Icon
                  aria-hidden
                  className="size-[1.125rem] shrink-0"
                  strokeWidth={active ? 2.25 : 2}
                />
                <span className="text-center">{t(labelKey)}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
