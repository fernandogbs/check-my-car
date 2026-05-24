import { CheckCircle2, Compass, List, TrendingUp } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { getInspectorMetrics } from '@/domain/inspection-requests/lib/inspector-queries'
import { Link } from '@/i18n/navigation'

type InspectorDashboardProps = {
  displayName: string | null
  userId: string
}

function firstNameFromDisplay(displayName: string | null): string | null {
  if (!displayName?.trim()) return null
  return displayName.trim().split(/\s+/)[0] ?? null
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export async function InspectorDashboard({ displayName, userId }: InspectorDashboardProps) {
  const t = await getTranslations('InspectorDashboard')
  const metrics = await getInspectorMetrics(userId)
  const firstName = firstNameFromDisplay(displayName)

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[#172339]">
          {firstName ? t('welcomeWithName', { name: firstName }) : t('welcomeGeneric')}
        </h1>
        <p className="text-sm leading-relaxed text-zinc-600">{t('subtitle')}</p>
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
          <p className="text-2xl font-semibold tabular-nums text-[#172339]">{metrics.accepted}</p>
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
          <p className="text-2xl font-semibold tabular-nums text-[#172339]">{metrics.completed}</p>
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
          <p className="text-base font-semibold tabular-nums text-[#172339]">
            {formatCurrency(metrics.earnings)}
          </p>
        </article>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-[#172339]">{t('quickActions')}</h2>
        <div className="flex flex-col gap-3">
          <Link
            href="/explore"
            className="flex items-center gap-4 rounded-2xl border border-black/[0.06] bg-white px-4 py-4 shadow-sm transition-colors hover:bg-zinc-50"
            style={{ boxShadow: '0 1px 2px color-mix(in oklch, var(--brand-auth) 8%, transparent)' }}
          >
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-brand-auth"
              style={{ background: 'color-mix(in oklch, var(--brand-auth) 14%, transparent)' }}
            >
              <Compass aria-hidden className="size-5" strokeWidth={2} />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-[#172339]">{t('exploreTitle')}</span>
              <span className="text-xs text-zinc-500">{t('exploreSubtitle')}</span>
            </div>
          </Link>

          <Link
            href="/activities"
            className="flex items-center gap-4 rounded-2xl border border-black/[0.06] bg-white px-4 py-4 shadow-sm transition-colors hover:bg-zinc-50"
            style={{ boxShadow: '0 1px 2px color-mix(in oklch, var(--brand-auth) 8%, transparent)' }}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <List aria-hidden className="size-5" strokeWidth={2} />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-[#172339]">{t('activitiesTitle')}</span>
              <span className="text-xs text-zinc-500">{t('activitiesSubtitle')}</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
