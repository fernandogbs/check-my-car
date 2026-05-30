'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/shared/components/ui/button'

type Props = {
  requestId: string
}

export function ReportDownloadButton({ requestId }: Props) {
  const t = useTranslations('BuyerDashboard.detail')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/inspection/requests/${requestId}/report/download`)
      if (!response.ok) {
        setError(t('reportDownloadError'))
        return
      }
      const body = await response.json().catch(() => null)
      if (!body?.url) {
        setError(t('reportDownloadError'))
        return
      }
      window.open(body.url, '_blank', 'noopener,noreferrer')
    } catch {
      setError(t('reportDownloadError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        className="rounded-xl"
        disabled={loading}
        onClick={handleDownload}
        type="button"
        variant="outline"
      >
        {loading ? '…' : t('reportDownload')}
      </Button>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
