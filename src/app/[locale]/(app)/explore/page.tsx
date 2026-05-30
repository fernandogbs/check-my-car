import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import { InspectorExplore } from '@/features/inspection-requests/components/inspector-explore'
import { getCurrentUser } from '@/features/auth/services/current-user'

type ExplorePageProps = {
  params: Promise<{ locale: string }>
}

export default async function ExplorePage({ params }: ExplorePageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const user = await getCurrentUser()

  if (!user || user.navRole !== 'inspector') {
    redirect('/dashboard')
  }

  return <InspectorExplore userId={user.id} />
}
