import type { InspectionRequestRow } from '@/features/inspection-requests/types/inspection-request-api'
import type { InspectionRequestStatus } from '@/lib/api/inspection-schemas'

const ACTIVE_STATUSES: readonly InspectionRequestStatus[] = [
  'draft',
  'pending',
  'accepted',
  'in_progress',
  'awaiting_report',
] as const

export type BuyerDashboardMetrics = {
  total: number
  active: number
  completed: number
}

export function isActiveInspectionStatus(status: string): status is InspectionRequestStatus {
  return (ACTIVE_STATUSES as readonly string[]).includes(status)
}

export function computeBuyerDashboardMetrics(
  rows: readonly InspectionRequestRow[],
): BuyerDashboardMetrics {
  let active = 0
  let completed = 0

  for (const row of rows) {
    if (row.status === 'completed') {
      completed += 1
      continue
    }
    if (row.status === 'cancelled') {
      continue
    }
    if (isActiveInspectionStatus(row.status)) {
      active += 1
    }
  }

  return {
    total: rows.length,
    active,
    completed,
  }
}

/** Namespace `BuyerDashboard` — use as `t(\`status.${status}\`)` with nested JSON. */
export function buyerDashboardStatusMessageKey(status: InspectionRequestRow['status']): string {
  return `status.${status}`
}
