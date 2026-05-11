import { setRequestLocale } from 'next-intl/server'

import { AppHeader } from '@/components/app/app-header'
import { BottomNav } from '@/components/app/bottom-nav'
import { getAppNavRole } from '@/lib/app/app-nav-role'

type AppShellLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function AppShellLayout({
  children,
  params,
}: AppShellLayoutProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const navRole = await getAppNavRole()

  return (
    <div className="flex min-h-svh flex-col bg-brand-auth-soft/30">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-[calc(5.25rem+env(safe-area-inset-bottom))] pt-5 sm:px-6">
        {children}
      </main>
      <BottomNav role={navRole} />
    </div>
  )
}
