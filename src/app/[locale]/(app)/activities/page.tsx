import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import { InspectorActivities } from '@/features/inspection-requests/components/inspector-activities'
import { getCurrentUser } from '@/features/auth/services/current-user'

type ActivitiesPageProps = {
  params: Promise<{ locale: string }>
}

export default async function ActivitiesPage({ params }: ActivitiesPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const user = await getCurrentUser()

  if (!user || user.navRole !== 'inspector') {
    redirect('/dashboard')
  }

  return <InspectorActivities userId={user.id} />
}
