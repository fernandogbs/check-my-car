import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BuyerDashboard } from '@/domain/inspection-requests/presentation/buyer-dashboard'
import { getCurrentUser } from '@/lib/auth/current-user'
import { createAdminClient } from '@/lib/supabase/admin'

type DashboardPageProps = {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const user = await getCurrentUser()
  const navRole = user?.navRole ?? 'buyer'

  if (navRole === 'inspector') {
    const t = await getTranslations('Nav')
    return (
      <div className="flex flex-1 flex-col">
        <h1 className="text-xl font-semibold tracking-tight text-[#172339]">
          {t('dashboard')}
        </h1>
      </div>
    )
  }

  if (!user) {
    const t = await getTranslations('Nav')
    return (
      <div className="flex flex-1 flex-col">
        <h1 className="text-xl font-semibold tracking-tight text-[#172339]">
          {t('dashboard')}
        </h1>
      </div>
    )
  }

  const displayName = user.nome

  const admin = createAdminClient()
  const { data: rows, error } = await admin
    .from('inspection_requests')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return <BuyerDashboard displayName={displayName} rows={rows ?? []} />
}
