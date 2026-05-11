import { Bell, Car } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

function getInitials(value: string | undefined | null): string {
  if (!value) {
    return '?'
  }
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return '?'
  }
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export async function AppHeader() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const t = await getTranslations('Auth')

  const user = data.user
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    null
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  return (
    <header className="sticky top-0 z-30 border-b border-black/[0.045] bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-brand-auth"
            style={{
              background:
                'color-mix(in oklch, var(--brand-auth) 14%, transparent)',
            }}
          >
            <Car aria-hidden className="size-[1.125rem]" strokeWidth={2.25} />
          </div>
          <span className="text-base font-bold tracking-tight text-brand-auth sm:text-lg">
            {t('brandName')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="flex size-9 items-center justify-center rounded-full text-brand-auth-muted transition-colors hover:bg-brand-auth-soft/70 hover:text-brand-auth"
            type="button"
          >
            <Bell aria-hidden className="size-5" strokeWidth={2} />
          </button>
          <div
            aria-label={displayName ?? undefined}
            className={cn(
              'flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-auth/15 text-xs font-semibold text-brand-auth ring-2 ring-white',
              'sm:size-10'
            )}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="size-full object-cover"
                src={avatarUrl}
              />
            ) : (
              <span>{getInitials(displayName)}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
