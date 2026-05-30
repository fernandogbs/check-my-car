'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@tanstack/react-query'

import { Button } from '@/shared/components/ui/button'
import { FileInput, type FileInputError } from '@/shared/components/ui/file-input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { RadioGroup, RadioItem, RadioIndicator } from '@/shared/components/ui/radio-group'
import { useRouter } from '@/i18n/navigation'
import { reportSummarySchema } from '@/lib/api/inspection-schemas'
import type { Json } from '@/lib/supabase/database.types'

type ResultValue = 'aprovado' | 'reprovado' | 'aprovado_com_ressalvas'
type ReportFormErrorCode =
  | 'generic'
  | 'unauthorized'
  | 'forbidden'
  | 'uploadFailed'
  | 'fileTooLarge'
  | 'fileType'
  | 'validation'
  | 'invalidState'

type Props = {
  requestId: string
  initialSummary: Json | null
}

async function uploadAttachment(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch('/api/inspection/attachments', { method: 'POST', body: formData })
  if (response.status === 401) throw new Error('unauthorized')
  if (!response.ok) throw new Error('uploadFailed')
  const body = await response.json().catch(() => null)
  if (!body?.path) throw new Error('uploadFailed')
  return body.path
}

type SubmitReportPayload = {
  requestId: string
  file: File | null
  resultado: ResultValue | ''
  observacoes: string
}

async function submitReport({
  requestId,
  file,
  resultado,
  observacoes,
}: SubmitReportPayload): Promise<void> {
  let reportPath: string | undefined
  if (file) {
    reportPath = await uploadAttachment(file)
  }
  const body = {
    report_storage_path: reportPath!,
    result_summary: { resultado, observacoes },
  }
  const response = await fetch(`/api/inspection/requests/${requestId}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (response.status === 401) throw new Error('unauthorized')
  if (response.status === 403) throw new Error('forbidden')
  if (response.status === 400) throw new Error('invalidState')
  if (!response.ok) throw new Error('generic')
}

function parseInitialSummary(initialSummary: Json | null): {
  resultado: ResultValue | ''
  observacoes: string
} {
  const parsed = reportSummarySchema.safeParse(initialSummary)
  if (parsed.success) {
    return {
      resultado: parsed.data.resultado,
      observacoes: parsed.data.observacoes ?? '',
    }
  }
  return { resultado: '', observacoes: '' }
}

export function InspectionReportForm({ requestId, initialSummary }: Props) {
  const router = useRouter()
  const t = useTranslations('InspectionReport')

  const initial = parseInitialSummary(initialSummary)

  const [file, setFile] = useState<File | null>(null)
  const [resultado, setResultado] = useState<ResultValue | ''>(initial.resultado)
  const [observacoes, setObservacoes] = useState<string>(initial.observacoes)
  const [formError, setFormError] = useState<ReportFormErrorCode | null>(null)

  const { mutate, isPending } = useMutation({
    mutationFn: () => submitReport({ requestId, file, resultado, observacoes }),
    onSuccess: () => router.push(`/requests/${requestId}`),
    onError: (error: Error) => {
      const code = error.message as ReportFormErrorCode
      setFormError(
        ['generic', 'unauthorized', 'forbidden', 'uploadFailed', 'invalidState'].includes(code)
          ? code
          : 'generic',
      )
    },
  })

  function handleSubmit() {
    if (!file || !resultado) {
      setFormError('validation')
      return
    }
    setFormError(null)
    mutate()
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {formError && (
        <p
          className="rounded-2xl border border-destructive/35 bg-destructive/6 px-3.5 py-2.5 text-sm leading-snug text-destructive"
          role="alert"
        >
          {t(`errors.${formError}`)}
        </p>
      )}

      {/* PDF upload */}
      <div className="flex flex-col gap-2">
        <Label>{t('file.title')}</Label>
        <FileInput
          acceptMime={['application/pdf']}
          title={t('file.title')}
          subtitle={t('file.subtitle')}
          cta={t('file.cta')}
          selectedLabel={t('file.selected')}
          changeLabel={t('file.change')}
          removeLabel={t('file.remove')}
          value={file}
          onChange={setFile}
          onValidationError={(err: FileInputError) => {
            setFormError(err)
            setFile(null)
          }}
          disabled={isPending}
        />
      </div>

      {/* Result radio */}
      <div className="flex flex-col gap-3">
        <Label>{t('result.label')}</Label>
        <RadioGroup value={resultado} onValueChange={(v) => setResultado(v as ResultValue)}>
          {(['aprovado', 'reprovado', 'aprovado_com_ressalvas'] as const).map((val) => (
            <RadioItem key={val} value={val} disabled={isPending}>
              <RadioIndicator />
              {t(`result.${val}`)}
            </RadioItem>
          ))}
        </RadioGroup>
      </div>

      {/* Observations */}
      <div className="flex flex-col gap-2">
        <Label>{t('observations.label')}</Label>
        <Textarea
          placeholder={t('observations.placeholder')}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          disabled={isPending}
          rows={4}
        />
      </div>

      {/* Sticky footer buttons */}
      <div className="sticky bottom-0 -mx-5 mt-auto flex gap-3 border-t border-black/[0.045] px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button
          className="h-12 flex-1 rounded-xl border-0 bg-brand-auth-soft/100 text-brand-auth-soft-foreground hover:bg-brand-auth-soft"
          disabled={isPending}
          onClick={() => router.push(`/requests/${requestId}`)}
          type="button"
          variant="secondary"
        >
          {t('actions.cancel')}
        </Button>
        <Button
          className="h-12 flex-1 rounded-xl bg-brand-auth text-base font-semibold text-brand-auth-foreground shadow-[0_16px_40px_-24px_rgb(37_112_216_/_90%)] hover:bg-brand-auth hover:brightness-[1.04] disabled:brightness-95"
          disabled={isPending}
          onClick={handleSubmit}
          type="button"
        >
          {isPending ? t('actions.submitting') : t('actions.submit')}
        </Button>
      </div>
    </div>
  )
}
