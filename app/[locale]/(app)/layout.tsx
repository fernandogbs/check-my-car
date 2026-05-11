import { setRequestLocale } from 'next-intl/server'

import { AppHeader } from '@/components/app/app-header'
import { BottomNav } from '@/components/app/bottom-nav'

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

  return (
    <div className="flex min-h-svh flex-col bg-brand-auth-soft/30">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-6 pt-5 sm:px-6">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
