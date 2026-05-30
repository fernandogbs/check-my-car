'use server'

import { getLocale } from 'next-intl/server'

import { getCurrentUser } from '@/features/auth/services/current-user'
import { redirect } from '@/i18n/navigation'
import {
  acceptInspection,
  updateInspectionStatus,
} from '@/features/inspection-requests/services/inspection-request.service'

export async function acceptInspectionAction(requestId: string): Promise<void> {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()])

  if (!user || user.navRole !== 'inspector') {
    redirect({ href: '/dashboard', locale })
    return
  }

  await acceptInspection(requestId, user.id)
  redirect({ href: `/requests/${requestId}`, locale })
}

export async function updateInspectionStatusAction(
  requestId: string,
  status: string,
): Promise<void> {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()])

  if (!user || user.navRole !== 'inspector') {
    redirect({ href: '/dashboard', locale })
    return
  }

  await updateInspectionStatus(requestId, user.id, status)
  redirect({ href: `/requests/${requestId}`, locale })
}
