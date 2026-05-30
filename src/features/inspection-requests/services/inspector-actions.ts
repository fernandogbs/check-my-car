'use server'

import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/features/auth/services/current-user'
import {
  acceptInspection,
  updateInspectionStatus,
} from '@/features/inspection-requests/services/inspection-request.service'

export async function acceptInspectionAction(requestId: string): Promise<void> {
  const user = await getCurrentUser()
  if (!user || user.navRole !== 'inspector') {
    redirect('/dashboard')
  }

  await acceptInspection(requestId, user.id)
  redirect(`/requests/${requestId}`)
}

export async function updateInspectionStatusAction(
  requestId: string,
  status: string,
): Promise<void> {
  const user = await getCurrentUser()
  if (!user || user.navRole !== 'inspector') {
    redirect('/dashboard')
  }

  await updateInspectionStatus(requestId, user.id, status)
  redirect(`/requests/${requestId}`)
}
