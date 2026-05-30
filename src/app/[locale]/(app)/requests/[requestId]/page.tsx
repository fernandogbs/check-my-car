import { notFound } from 'next/navigation'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'

import {
  acceptInspectionAction,
  updateInspectionStatusAction,
} from '@/features/inspection-requests/services/inspector-actions'
import { buyerDashboardStatusMessageKey } from '@/features/inspection-requests/utils/buyer-dashboard-metrics'
import { ReportDownloadButton } from '@/features/inspection-requests/components/report-download-button'
import { reportSummarySchema } from '@/lib/api/inspection-schemas'
import { Link } from '@/i18n/navigation'
import { getCurrentUser } from '@/features/auth/services/current-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { cn } from '@/lib/utils'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-900'
    case 'cancelled':
      return 'bg-zinc-100 text-zinc-700'
    case 'pending':
    case 'draft':
      return 'bg-amber-100 text-amber-950'
    case 'accepted':
    case 'in_progress':
    case 'awaiting_report':
      return 'bg-sky-100 text-sky-950'
    default:
      return 'bg-zinc-100 text-zinc-800'
  }
}

function InspectorActions({
  requestId,
  status,
  isAcceptor,
  submitLabel,
  resubmitLabel,
}: {
  requestId: string
  status: string
  isAcceptor: boolean
  submitLabel: string
  resubmitLabel: string
}) {
  if (status === 'pending') {
    return (
      <form
        action={async () => {
          'use server'
          await acceptInspectionAction(requestId)
        }}
      >
        <button
          type="submit"
          className="w-full rounded-xl bg-[#0055FF] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Aceitar inspeção
        </button>
      </form>
    )
  }

  if (!isAcceptor) return null

  if (status === 'accepted') {
    return (
      <form
        action={async () => {
          'use server'
          await updateInspectionStatusAction(requestId, 'in_progress')
        }}
      >
        <button
          type="submit"
          className="w-full rounded-xl bg-[#0055FF] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Iniciar inspeção
        </button>
      </form>
    )
  }

  if (status === 'in_progress') {
    return (
      <Link
        href={`/requests/${requestId}/report`}
        className="w-full rounded-xl bg-[#0055FF] py-3 text-sm font-semibold text-center text-white transition-opacity hover:opacity-90 block"
      >
        {submitLabel}
      </Link>
    )
  }

  if (status === 'awaiting_report') {
    return (
      <div className="flex flex-col gap-3">
        <Link
          href={`/requests/${requestId}/report`}
          className="w-full rounded-xl border border-[#0055FF]/25 py-3 text-sm font-semibold text-center text-[#0055FF] transition-opacity hover:opacity-80 block"
        >
          {resubmitLabel}
        </Link>
        <form
          action={async () => {
            'use server'
            await updateInspectionStatusAction(requestId, 'completed')
          }}
        >
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Concluir inspeção
          </button>
        </form>
      </div>
    )
  }

  return null
}

type InspectionRequestDetailPageProps = {
  params: Promise<{ locale: string; requestId: string }>
}

export default async function InspectionRequestDetailPage({
  params,
}: InspectionRequestDetailPageProps) {
  const { locale, requestId } = await params
  setRequestLocale(locale)

  if (!UUID_RE.test(requestId)) {
    notFound()
  }

  const [user, admin] = await Promise.all([
    getCurrentUser(),
    createAdminClient(),
  ])

  const { data: row, error } = await admin
    .from('inspection_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle()

  if (error || !row) {
    notFound()
  }

  const canRead =
    row.created_by === user?.id ||
    row.accepted_by === user?.id ||
    (row.status === 'pending' && user?.navRole === 'inspector')

  if (!canRead) {
    notFound()
  }

  const t = await getTranslations('BuyerDashboard')
  const tTypes = await getTranslations('InspectionRequest.market.type')
  const format = await getFormatter()
  const statusKey = buyerDashboardStatusMessageKey(row.status)
  const created = new Date(row.created_at)
  const updated = new Date(row.updated_at)

  const isInspector = user?.navRole === 'inspector'
  const isAcceptor = isInspector && row.accepted_by === user?.id
  const backHref = isInspector ? '/activities' : '/dashboard'
  const backLabel = isInspector ? 'Voltar às atividades' : t('detail.back')

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          className="text-sm font-medium text-brand-auth hover:underline"
          href={backHref}
        >
          {backLabel}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-[#172339]">
            {t('detail.title')}
          </h1>
          <span
            className={cn(
              'shrink-0 rounded-full px-3 py-1 text-xs font-semibold',
              statusBadgeClass(row.status),
            )}
          >
            {t(statusKey)}
          </span>
        </div>
      </div>

      <dl className="flex flex-col gap-4 rounded-2xl border border-black/[0.06] bg-white px-4 py-5 shadow-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t('detail.model')}
          </dt>
          <dd className="mt-1 text-base font-semibold text-[#172339]">{row.vehicle_model}</dd>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {t('detail.plate')}
            </dt>
            <dd className="mt-1 text-sm text-zinc-800">{row.vehicle_plate}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {t('detail.year')}
            </dt>
            <dd className="mt-1 text-sm text-zinc-800">{row.vehicle_year}</dd>
          </div>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t('detail.type')}
          </dt>
          <dd className="mt-1 text-sm text-zinc-800">{tTypes(row.inspection_type)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t('detail.location')}
          </dt>
          <dd className="mt-1 text-sm text-zinc-800">{row.inspection_location}</dd>
        </div>
        {row.notes && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Observações
            </dt>
            <dd className="mt-1 text-sm text-zinc-800">{row.notes}</dd>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 border-t border-zinc-100 pt-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {t('detail.created')}
            </dt>
            <dd className="mt-1 text-sm text-zinc-800">
              {format.dateTime(created, { dateStyle: 'medium', timeStyle: 'short' })}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {t('detail.updated')}
            </dt>
            <dd className="mt-1 text-sm text-zinc-800">
              {format.dateTime(updated, { dateStyle: 'medium', timeStyle: 'short' })}
            </dd>
          </div>
        </div>
      </dl>

      {(() => {
        const summaryParsed = reportSummarySchema.safeParse(row.result_summary)
        const summary = summaryParsed.success ? summaryParsed.data : null

        if (row.report_storage_path) {
          return (
            <section className="flex flex-col gap-4 rounded-2xl border border-black/[0.06] bg-white px-4 py-5 shadow-sm">
              <h2 className="text-base font-semibold text-[#172339]">{t('detail.reportSection')}</h2>
              {summary ? (
                <>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{t('detail.reportResult')}</dt>
                    <dd className="mt-1">
                      <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                        summary.resultado === 'aprovado' ? 'bg-emerald-100 text-emerald-900' :
                        summary.resultado === 'reprovado' ? 'bg-red-100 text-red-900' :
                        'bg-amber-100 text-amber-950'
                      )}>
                        {t(`status.result.${summary.resultado}`)}
                      </span>
                    </dd>
                  </div>
                  {summary.observacoes && (
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{t('detail.reportObservations')}</dt>
                      <dd className="mt-1 text-sm text-zinc-800">{summary.observacoes}</dd>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-zinc-600">{t('detail.reportEmpty')}</p>
              )}
              {row.report_submitted_at && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{t('detail.reportSubmittedAt')}</dt>
                  <dd className="mt-1 text-sm text-zinc-800">
                    {format.dateTime(new Date(row.report_submitted_at), { dateStyle: 'medium', timeStyle: 'short' })}
                  </dd>
                </div>
              )}
              <ReportDownloadButton requestId={row.id} />
            </section>
          )
        }

        if (!row.report_storage_path && row.status !== 'pending' && row.created_by === user?.id) {
          return <p className="text-sm text-zinc-500 italic">{t('detail.reportEmpty')}</p>
        }

        return null
      })()}

      {isInspector && !['completed', 'cancelled'].includes(row.status) && (
        <InspectorActions
          requestId={row.id}
          status={row.status}
          isAcceptor={isAcceptor}
          submitLabel={t('detail.submitReport')}
          resubmitLabel={t('detail.resubmitReport')}
        />
      )}
    </div>
  )
}
