'use client'

import { ClipboardList } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { FileInput, type FileInputError } from '@/shared/components/ui/file-input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'

import type { AdditionalSlice } from '../../types/inspection-request-schema'

type AdditionalFormValues = {
  notes: string
  attachment: File | null
}

type FieldErrors = Partial<Record<keyof AdditionalSlice, true>>

type AdditionalStepProps = {
  values: AdditionalFormValues
  errors: FieldErrors
  onNotesChange: (value: string) => void
  onAttachmentChange: (file: File | null) => void
  onAttachmentError: (error: FileInputError) => void
}

export function AdditionalStep({
  values,
  errors,
  onNotesChange,
  onAttachmentChange,
  onAttachmentError,
}: AdditionalStepProps) {
  const t = useTranslations('InspectionRequest.additional')
  const tValidation = useTranslations('InspectionRequest.validation')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[1.05rem] font-semibold text-foreground">
          <ClipboardList
            aria-hidden
            className="size-5 text-brand-auth"
            strokeWidth={2}
          />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label
            className="text-[0.9375rem] font-medium text-foreground"
            htmlFor="notes"
          >
            {t('notes.label')}
          </Label>
          <Textarea
            aria-describedby={errors.notes ? 'notes-error' : undefined}
            aria-invalid={errors.notes ? true : undefined}
            className="min-h-28 rounded-xl border-0 bg-brand-auth-soft/90 px-4 py-3 shadow-none ring-0 placeholder:text-brand-auth-muted/80 focus-visible:ring-[3px] focus-visible:ring-brand-auth/18"
            id="notes"
            maxLength={4000}
            name="notes"
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder={t('notes.placeholder')}
            value={values.notes}
          />
          {errors.notes ? (
            <p className="text-xs leading-snug text-destructive" id="notes-error">
              {tValidation('notesTooLong')}
            </p>
          ) : null}
        </div>

        <FileInput
          changeLabel={t('document.change')}
          cta={t('document.cta')}
          onChange={onAttachmentChange}
          onValidationError={onAttachmentError}
          removeLabel={t('document.remove')}
          selectedLabel={t('document.selected')}
          subtitle={t('document.subtitle')}
          title={t('document.title')}
          value={values.attachment}
        />
      </CardContent>
    </Card>
  )
}
