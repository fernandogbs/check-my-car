import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BuyerDashboard } from '@/domain/inspection-requests/presentation/buyer-dashboard'
import { getAppNavRole } from '@/lib/app/app-nav-role'
import { createClient } from '@/lib/supabase/server'

type DashboardPageProps = {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const navRole = await getAppNavRole()

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

  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user

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

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    null

  const { data: rows, error } = await supabase
    .from('inspection_requests')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return <BuyerDashboard displayName={displayName} rows={rows ?? []} />
}
