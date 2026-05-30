import { setRequestLocale } from 'next-intl/server'

import { InspectorDashboard } from '@/features/inspection-requests/components/inspector-dashboard'
import { BuyerDashboard } from '@/features/inspection-requests/components/buyer-dashboard'
import { getCurrentUser } from '@/features/auth/services/current-user'
import { getBuyerInspectionRequests } from '@/features/inspection-requests/services/inspection-request.service'

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

  const rows = await getBuyerInspectionRequests(user.id)
  return <BuyerDashboard displayName={user.nome} rows={rows} />
}
