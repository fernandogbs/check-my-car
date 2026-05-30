import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import type { InspectionRequestRow } from '@/features/inspection-requests/types/inspection-request-api'

const PRICE_BY_TYPE: Record<string, number> = {
  cautelar: 200,
  transferencia: 150,
}

export type InspectorMetrics = {
  accepted: number
  completed: number
  earnings: number
}

// --- Queries ---

export async function getBuyerInspectionRequests(
  userId: string,
): Promise<InspectionRequestRow[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('inspection_requests')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getInspectorMetrics(userId: string): Promise<InspectorMetrics> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('inspection_requests')
    .select('status, inspection_type')
    .eq('accepted_by', userId)

  if (error || !data) return { accepted: 0, completed: 0, earnings: 0 }

  let completed = 0
  let earnings = 0
  for (const row of data) {
    if (row.status === 'completed') {
      completed += 1
      earnings += PRICE_BY_TYPE[row.inspection_type] ?? 0
    }
  }
  return { accepted: data.length, completed, earnings }
}

export async function getActiveInspection(userId: string): Promise<InspectionRequestRow | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('inspection_requests')
    .select('*')
    .eq('accepted_by', userId)
    .in('status', ['accepted', 'in_progress', 'awaiting_report'])
    .order('accepted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return null
  return data
}

export async function getScheduledInspections(userId: string): Promise<InspectionRequestRow[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('inspection_requests')
    .select('*')
    .eq('accepted_by', userId)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error || !data) return []
  return data
}

export async function getPendingRequestsForExplore(
  userId: string,
): Promise<InspectionRequestRow[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('inspection_requests')
    .select('*')
    .eq('status', 'pending')
    .is('accepted_by', null)
    .neq('created_by', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error || !data) return []
  return data
}

// --- Mutations ---

export async function acceptInspection(requestId: string, inspectorId: string): Promise<void> {
  const admin = createAdminClient()
  await admin
    .from('inspection_requests')
    .update({
      accepted_by: inspectorId,
      accepted_at: new Date().toISOString(),
      status: 'accepted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('status', 'pending')
    .is('accepted_by', null)
}

export async function updateInspectionStatus(
  requestId: string,
  inspectorId: string,
  status: string,
): Promise<void> {
  const admin = createAdminClient()

  if (status === 'completed') {
    const { data: row } = await admin
      .from('inspection_requests')
      .select('report_storage_path, accepted_by')
      .eq('id', requestId)
      .maybeSingle()

    if (!row?.accepted_by) {
      throw new Error('invalid_transition')
    }

    if (!row?.report_storage_path) {
      throw new Error('invalid_transition')
    }
  }

  await admin
    .from('inspection_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('accepted_by', inspectorId)
}
