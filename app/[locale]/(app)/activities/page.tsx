import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import { InspectorActivities } from '@/domain/inspection-requests/presentation/inspector-activities'
import { getCurrentUser } from '@/lib/auth/current-user'

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
