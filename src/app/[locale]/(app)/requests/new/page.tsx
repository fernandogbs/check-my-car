import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

import { NewInspectionRequestForm } from '@/features/inspection-requests/components/new-inspection-request-form'

type NewRequestPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: NewRequestPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'InspectionRequest' })
  return {
    title: t('title'),
    description: t('subtitle'),
  }
}

export default async function NewInspectionRequestPage({
  params,
}: NewRequestPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return <NewInspectionRequestForm />
}
