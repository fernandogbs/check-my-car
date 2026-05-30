import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

import { canSubmitReport } from '@/features/inspection-requests/utils/report-visibility'
import { InspectionReportForm } from '@/features/inspection-requests/components/inspection-report-form'
import { getCurrentUser } from '@/features/auth/services/current-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { Link } from '@/i18n/navigation'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type Props = { params: Promise<{ locale: string; requestId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'InspectionReport' })
  return {
    title: t('title'),
  }
}

export default async function InspectionReportPage({ params }: Props) {
  const { locale, requestId } = await params
  setRequestLocale(locale)

  if (!UUID_RE.test(requestId)) {
    notFound()
  }

  const [user, admin] = await Promise.all([getCurrentUser(), createAdminClient()])

  const { data: row, error } = await admin
    .from('inspection_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle()

  if (error || !row) notFound()

  if (!user) notFound()

  if (
    !canSubmitReport({
      navRole: user.navRole,
      userId: user.id,
      acceptedBy: row.accepted_by,
      status: row.status,
    })
  ) {
    notFound()
  }

  const t = await getTranslations('InspectionReport')
  const tDashboard = await getTranslations('BuyerDashboard')

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href={`/requests/${requestId}`}
          className="text-sm font-medium text-brand-auth hover:underline"
        >
          {tDashboard('detail.back')}
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-[#172339]">
          {t('title')}
        </h1>
        <p className="text-sm text-zinc-600">
          {row.vehicle_model} · {row.vehicle_plate} · {row.vehicle_year}
        </p>
      </div>
      <InspectionReportForm
        requestId={requestId}
        initialSummary={row.result_summary}
      />
    </div>
  )
}
