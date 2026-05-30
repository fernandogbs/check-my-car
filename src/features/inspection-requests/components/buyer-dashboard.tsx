import { CheckCircle2, ClipboardList, FileText } from 'lucide-react'
import { getFormatter, getTranslations } from 'next-intl/server'

import {
  buyerDashboardStatusMessageKey,
  computeBuyerDashboardMetrics,
} from '@/features/inspection-requests/utils/buyer-dashboard-metrics'
import type { InspectionRequestRow } from '@/features/inspection-requests/types/inspection-request-api'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export type BuyerDashboardProps = {
  displayName: string | null
  rows: readonly InspectionRequestRow[]
}

function firstNameFromDisplay(displayName: string | null): string | null {
  if (!displayName?.trim()) {
    return null
  }
  const first = displayName.trim().split(/\s+/)[0]
  return first ?? null
}

function statusBadgeClass(status: InspectionRequestRow['status']): string {
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

export async function BuyerDashboard({ displayName, rows }: BuyerDashboardProps) {
  const t = await getTranslations('BuyerDashboard')
  const tTypes = await getTranslations('InspectionRequest.market.type')
  const format = await getFormatter()
  const metrics = computeBuyerDashboardMetrics(rows)
  const firstName = firstNameFromDisplay(displayName)

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[#172339]">
          {firstName ? t('welcomeWithName', { name: firstName }) : t('welcomeGeneric')}
        </h1>
        <p className="text-sm leading-relaxed text-zinc-600">{t('subtitle')}</p>
      </header>

      <section aria-label={t('metrics.total')} className="grid grid-cols-3 gap-2 sm:gap-3">
        <article
          className="flex flex-col gap-2 rounded-2xl border border-black/[0.06] bg-white px-3 py-3 shadow-sm sm:px-4 sm:py-4"
          style={{
            boxShadow: '0 1px 2px color-mix(in oklch, var(--brand-auth) 8%, transparent)',
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.65rem] font-medium uppercase tracking-wide text-zinc-500 sm:text-xs">
              {t('metrics.total')}
            </span>
            <span
              className="flex size-8 items-center justify-center rounded-xl text-brand-auth"
              style={{
                background: 'color-mix(in oklch, var(--brand-auth) 14%, transparent)',
              }}
            >
              <FileText aria-hidden className="size-4" strokeWidth={2.25} />
            </span>
          </div>
          <p className="text-2xl font-semibold tabular-nums text-[#172339]">{metrics.total}</p>
        </article>

        <article
          className="flex flex-col gap-2 rounded-2xl border border-black/[0.06] bg-white px-3 py-3 shadow-sm sm:px-4 sm:py-4"
          style={{
            boxShadow: '0 1px 2px color-mix(in oklch, var(--brand-auth) 8%, transparent)',
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.65rem] font-medium uppercase tracking-wide text-zinc-500 sm:text-xs">
              {t('metrics.active')}
            </span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
              <ClipboardList aria-hidden className="size-4" strokeWidth={2.25} />
            </span>
          </div>
          <p className="text-2xl font-semibold tabular-nums text-[#172339]">{metrics.active}</p>
        </article>

        <article
          className="flex flex-col gap-2 rounded-2xl border border-black/[0.06] bg-white px-3 py-3 shadow-sm sm:px-4 sm:py-4"
          style={{
            boxShadow: '0 1px 2px color-mix(in oklch, var(--brand-auth) 8%, transparent)',
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.65rem] font-medium uppercase tracking-wide text-zinc-500 sm:text-xs">
              {t('metrics.completed')}
            </span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-sky-100 text-sky-900">
              <CheckCircle2 aria-hidden className="size-4" strokeWidth={2.25} />
            </span>
          </div>
          <p className="text-2xl font-semibold tabular-nums text-[#172339]">{metrics.completed}</p>
        </article>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-[#172339]">{t('sectionRequests')}</h2>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-200 bg-white/80 px-4 py-8 text-center text-sm text-zinc-600">
            {t('empty')}
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {rows.map((row) => {
              const updated = new Date(row.updated_at)
              const relativeUpdated = format.relativeTime(updated)
              const statusKey = buyerDashboardStatusMessageKey(row.status)
              const typeLabel = tTypes(row.inspection_type)

              return (
                <li key={row.id}>
                  <article
                    className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm"
                    style={{
                      boxShadow:
                        '0 1px 2px color-mix(in oklch, var(--brand-auth) 8%, transparent)',
                    }}
                  >
                    <div className="relative aspect-[21/9] min-h-[100px] w-full bg-gradient-to-br from-zinc-100 to-zinc-200">
                      <span
                        className={cn(
                          'absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold',
                          statusBadgeClass(row.status),
                        )}
                      >
                        {t(statusKey)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-3 px-4 pb-4 pt-3">
                      <div>
                        <h3 className="text-base font-semibold text-[#172339]">
                          {row.vehicle_model}
                        </h3>
                        <p className="mt-0.5 text-sm text-zinc-600">
                          {row.vehicle_plate}
                          {' · '}
                          {row.vehicle_year}
                          {' · '}
                          {typeLabel}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                        <p className="text-xs text-zinc-500">
                          {t('updated', { time: relativeUpdated })}
                        </p>
                        {row.status === 'completed' ? (
                          <Link
                            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-auth px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            href={`/requests/${row.id}`}
                          >
                            {t('ctaReport')}
                          </Link>
                        ) : (
                          <Link
                            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-brand-auth/25 bg-brand-auth-soft/40 px-4 py-2 text-sm font-semibold text-brand-auth transition-colors hover:bg-brand-auth-soft/70"
                            href={`/requests/${row.id}`}
                          >
                            {t('ctaDetails')}
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
