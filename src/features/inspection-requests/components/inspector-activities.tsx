import { CheckCircle2, Clock, List, MapPin, TrendingUp } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import {
  getActiveInspection,
  getInspectorMetrics,
  getScheduledInspections,
} from '@/features/inspection-requests/services/inspection-request.service'
import type { InspectionRequestRow } from '@/features/inspection-requests/types/inspection-request-api'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

type InspectorActivitiesProps = {
  userId: string
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'in_progress':
      return 'bg-[#0055FF] text-white'
    case 'accepted':
      return 'bg-sky-100 text-sky-900'
    case 'awaiting_report':
      return 'bg-amber-100 text-amber-900'
    default:
      return 'bg-zinc-100 text-zinc-700'
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'in_progress':
      return 'EM ANDAMENTO'
    case 'accepted':
      return 'ACEITA'
    case 'awaiting_report':
      return 'AG. LAUDO'
    default:
      return status.toUpperCase()
  }
}

function typeLabel(type: string): string {
  switch (type) {
    case 'cautelar':
      return 'CAUTELAR'
    case 'transferencia':
      return 'TRANSFERÊNCIA'
    default:
      return type.toUpperCase()
  }
}

function ActiveInspectionCard({ row }: { row: InspectionRequestRow }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
      <div className="relative aspect-[16/7] w-full overflow-hidden bg-gradient-to-br from-slate-200 via-slate-300 to-blue-200">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(100,120,180,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100,120,180,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#0055FF] shadow-lg">
            <MapPin aria-hidden className="size-5 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          <span className="size-1.5 rounded-full bg-red-400" />
          Rastreamento ativo
        </span>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#172339]">{row.vehicle_model}</h3>
            <p className="mt-0.5 text-sm text-zinc-500">
              {typeLabel(row.inspection_type)} · {row.vehicle_year} · {row.vehicle_plate}
            </p>
          </div>
          <span
            className={cn(
              'shrink-0 rounded-full px-3 py-1 text-[0.625rem] font-bold tracking-wide',
              statusBadgeClass(row.status),
            )}
          >
            {statusLabel(row.status)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl bg-zinc-50 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Clock aria-hidden className="size-4 shrink-0 text-zinc-400" strokeWidth={2} />
            <span className="text-xs font-medium text-zinc-700">Estimativa: 45 min</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin aria-hidden className="size-4 shrink-0 text-zinc-400" strokeWidth={2} />
            <span className="text-xs font-medium text-zinc-700">2.4 km</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-sm text-zinc-700">
          <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-zinc-400" strokeWidth={2} />
          <span>{row.inspection_location}</span>
        </div>

        <Link
          href={`/requests/${row.id}`}
          className="flex w-full items-center justify-center rounded-xl bg-[#0055FF] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Retomar inspeção
        </Link>
      </div>
    </article>
  )
}

function ScheduledInspectionItem({ row }: { row: InspectionRequestRow }) {
  return (
    <li>
      <Link
        href={`/requests/${row.id}`}
        className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white px-4 py-3 shadow-sm transition-colors hover:bg-zinc-50"
      >
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200">
          <MapPin aria-hidden className="size-6 text-zinc-400" strokeWidth={1.5} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-semibold text-[#172339]">{row.vehicle_model}</span>
          </div>
          <p className="truncate text-xs text-zinc-500">{row.inspection_location}</p>
          <div className="mt-0.5 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-zinc-600">
              {typeLabel(row.inspection_type)}
            </span>
          </div>
        </div>
        <svg
          aria-hidden
          className="size-4 shrink-0 text-zinc-300"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </li>
  )
}

export async function InspectorActivities({ userId }: InspectorActivitiesProps) {
  const t = await getTranslations('InspectorActivities')
  const [metrics, activeInspection, scheduled] = await Promise.all([
    getInspectorMetrics(userId),
    getActiveInspection(userId),
    getScheduledInspections(userId),
  ])

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-[#172339]">{t('title')}</h1>
      </header>

      <section className="grid grid-cols-3 gap-2 sm:gap-3">
        <article
          className="flex flex-col gap-2 rounded-2xl border border-black/[0.06] bg-white px-3 py-3 shadow-sm sm:px-4 sm:py-4"
          style={{ boxShadow: '0 1px 2px color-mix(in oklch, var(--brand-auth) 8%, transparent)' }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.65rem] font-medium uppercase tracking-wide text-zinc-500 sm:text-xs">
              {t('metrics.accepted')}
            </span>
            <span
              className="flex size-8 items-center justify-center rounded-xl text-brand-auth"
              style={{ background: 'color-mix(in oklch, var(--brand-auth) 14%, transparent)' }}
            >
              <List aria-hidden className="size-4" strokeWidth={2.25} />
            </span>
          </div>
          <p className="text-2xl font-semibold tabular-nums text-[#172339]">
            {String(metrics.accepted).padStart(2, '0')}
          </p>
        </article>

        <article
          className="flex flex-col gap-2 rounded-2xl border border-black/[0.06] bg-white px-3 py-3 shadow-sm sm:px-4 sm:py-4"
          style={{ boxShadow: '0 1px 2px color-mix(in oklch, var(--brand-auth) 8%, transparent)' }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.65rem] font-medium uppercase tracking-wide text-zinc-500 sm:text-xs">
              {t('metrics.completed')}
            </span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 aria-hidden className="size-4" strokeWidth={2.25} />
            </span>
          </div>
          <p className="text-2xl font-semibold tabular-nums text-[#172339]">
            {String(metrics.completed).padStart(2, '0')}
          </p>
        </article>

        <article
          className="flex flex-col gap-2 rounded-2xl border border-black/[0.06] bg-white px-3 py-3 shadow-sm sm:px-4 sm:py-4"
          style={{ boxShadow: '0 1px 2px color-mix(in oklch, var(--brand-auth) 8%, transparent)' }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.65rem] font-medium uppercase tracking-wide text-zinc-500 sm:text-xs">
              {t('metrics.earnings')}
            </span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <TrendingUp aria-hidden className="size-4" strokeWidth={2.25} />
            </span>
          </div>
          <p className="text-sm font-semibold tabular-nums text-[#172339]">
            {formatCurrency(metrics.earnings)}
          </p>
        </article>
      </section>

      {activeInspection && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-[#172339]">{t('sectionActive')}</h2>
          <ActiveInspectionCard row={activeInspection} />
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-[#172339]">{t('sectionScheduled')}</h2>
          <Link href="/explore" className="text-sm font-medium text-brand-auth hover:underline">
            {t('viewHistory')}
          </Link>
        </div>

        {scheduled.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-200 bg-white/80 px-4 py-8 text-center text-sm text-zinc-600">
            {t('emptyScheduled')}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {scheduled.map((row) => (
              <ScheduledInspectionItem key={row.id} row={row} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
