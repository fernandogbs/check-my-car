import { MapPin } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { acceptInspectionAction } from '@/features/inspection-requests/services/inspector-actions'
import { getPendingRequestsForExplore } from '@/features/inspection-requests/services/inspection-request.service'
import type { InspectionRequestRow } from '@/features/inspection-requests/types/inspection-request-api'

type InspectorExploreProps = {
  userId: string
}

function typeLabel(type: string): string {
  switch (type) {
    case 'cautelar':
      return 'Cautelar'
    case 'transferencia':
      return 'Transferência'
    default:
      return type
  }
}

function PendingRequestCard({
  row,
  acceptAction,
}: {
  row: InspectionRequestRow
  acceptAction: (id: string) => Promise<void>
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
      <div className="flex items-start gap-4 px-4 pt-4">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200">
          <MapPin aria-hidden className="size-6 text-zinc-400" strokeWidth={1.5} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="text-sm font-semibold text-[#172339]">{row.vehicle_model}</h3>
          <p className="text-xs text-zinc-500">
            {row.vehicle_plate} · {row.vehicle_year}
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-zinc-600">
              {typeLabel(row.inspection_type)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 px-4 text-xs text-zinc-600">
        <MapPin aria-hidden className="mt-0.5 size-3.5 shrink-0 text-zinc-400" strokeWidth={2} />
        <span>{row.inspection_location}</span>
      </div>

      <div className="mt-3 border-t border-zinc-100 px-4 py-3">
        <form
          action={async () => {
            'use server'
            await acceptAction(row.id)
          }}
        >
          <button
            type="submit"
            className="w-full rounded-xl bg-[#0055FF] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-75"
          >
            Aceitar inspeção
          </button>
        </form>
      </div>
    </article>
  )
}

export async function InspectorExplore({ userId }: InspectorExploreProps) {
  const t = await getTranslations('InspectorExplore')
  const rows = await getPendingRequestsForExplore(userId)

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[#172339]">{t('title')}</h1>
        <p className="text-sm leading-relaxed text-zinc-600">{t('subtitle')}</p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-200 bg-white/80 px-4 py-12 text-center text-sm text-zinc-600">
          {t('empty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((row) => (
            <li key={row.id}>
              <PendingRequestCard row={row} acceptAction={acceptInspectionAction} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
