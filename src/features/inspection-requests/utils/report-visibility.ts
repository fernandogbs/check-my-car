/**
 * Pure visibility helpers — no Supabase, no server-only imports.
 * Mirrors the inline checks in:
 *   - result/route.ts (canViewReport)
 *   - report/route.ts (canSubmitReport)
 */

export type CanViewReportInput = {
  userId: string
  createdBy: string
  acceptedBy: string | null
  status: string
}

/**
 * Returns true if the user is allowed to see the inspection report.
 * Mirrors: creator OR acceptor OR (status === 'pending' && acceptedBy === null)
 */
export function canViewReport(input: CanViewReportInput): boolean {
  const { userId, createdBy, acceptedBy, status } = input
  return (
    createdBy === userId ||
    acceptedBy === userId ||
    (status === 'pending' && acceptedBy === null)
  )
}

export type CanSubmitReportInput = {
  navRole: string
  userId: string
  acceptedBy: string | null
  status: string
}

const SUBMIT_ALLOWED_STATUSES = ['accepted', 'in_progress', 'awaiting_report'] as const

/**
 * Returns true if the user is allowed to submit (or resubmit) the inspection report.
 * Mirrors: navRole === 'inspector' && acceptedBy === userId && status in [accepted, in_progress, awaiting_report]
 */
export function canSubmitReport(input: CanSubmitReportInput): boolean {
  const { navRole, userId, acceptedBy, status } = input
  return (
    navRole === 'inspector' &&
    acceptedBy === userId &&
    (SUBMIT_ALLOWED_STATUSES as readonly string[]).includes(status)
  )
}
