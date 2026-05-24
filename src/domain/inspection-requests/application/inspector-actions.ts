'use server'

import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/auth/current-user'
import { createAdminClient } from '@/lib/supabase/admin'

export async function acceptInspectionAction(requestId: string): Promise<void> {
  const user = await getCurrentUser()
  if (!user || user.navRole !== 'inspector') {
    redirect('/dashboard')
  }

  const admin = createAdminClient()
  await admin
    .from('inspection_requests')
    .update({
      accepted_by: user.id,
      accepted_at: new Date().toISOString(),
      status: 'accepted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('status', 'pending')
    .is('accepted_by', null)

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

  const admin = createAdminClient()
  await admin
    .from('inspection_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('accepted_by', user.id)

  redirect(`/requests/${requestId}`)
}
