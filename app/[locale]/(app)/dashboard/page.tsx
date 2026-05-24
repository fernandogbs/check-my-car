import { setRequestLocale } from 'next-intl/server'

import { InspectorDashboard } from '@/domain/inspection-requests/presentation/inspector-dashboard'
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

  if (!user) {
    return null
  }

  if (user.navRole === 'inspector') {
    return <InspectorDashboard displayName={user.nome} userId={user.id} />
  }

  const admin = createAdminClient()
  const { data: rows, error } = await admin
    .from('inspection_requests')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return <BuyerDashboard displayName={user.nome} rows={rows ?? []} />
}
