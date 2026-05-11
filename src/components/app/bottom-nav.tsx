'use client'

import { Compass, LayoutGrid, ListChecks, UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

type NavItem = {
  href: '/' | '/explore' | '/requests' | '/profile'
  labelKey: 'dashboard' | 'explore' | 'activities' | 'profile'
  match: (path: string) => boolean
  Icon: typeof LayoutGrid
}

const items: readonly NavItem[] = [
  {
    href: '/',
    labelKey: 'dashboard',
    match: (path) => path === '/' || path === '',
    Icon: LayoutGrid,
  },
  {
    href: '/explore',
    labelKey: 'explore',
    match: (path) => path.startsWith('/explore'),
    Icon: Compass,
  },
  {
    href: '/requests',
    labelKey: 'activities',
    match: (path) => path.startsWith('/requests') || path.startsWith('/activities'),
    Icon: ListChecks,
  },
  {
    href: '/profile',
    labelKey: 'profile',
    match: (path) => path.startsWith('/profile'),
    Icon: UserRound,
  },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const t = useTranslations('Nav')

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-30 border-t border-black/[0.045] bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
    >
      <ul className="mx-auto grid w-full max-w-2xl grid-cols-4 px-3 py-2 sm:px-6">
        {items.map(({ href, labelKey, match, Icon }) => {
          const active = match(pathname)
          return (
            <li key={href}>
              <Link
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'bg-brand-auth text-brand-auth-foreground shadow-[0_10px_28px_-16px_rgb(37_112_216_/_75%)]'
                    : 'text-brand-auth-muted hover:bg-brand-auth-soft/60 hover:text-brand-auth'
                )}
                href={href}
              >
                <Icon
                  aria-hidden
                  className="size-[1.125rem]"
                  strokeWidth={2}
                />
                <span>{t(labelKey)}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
