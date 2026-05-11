'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import type { FileInputError } from '@/components/ui/file-input'
import { useRouter } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'

import {
  additionalSlice,
  marketSlice,
  vehicleSlice,
  type AdditionalSlice,
  type MarketSlice,
  type VehicleSlice,
} from '../model/inspection-request-schema'
import type { InspectionType } from '../model/inspection-type'
import type {
  ApiErrorBody,
  CreateInspectionRequestResponse,
  CreateInspectionRequestSuccess,
} from '../model/inspection-request-api'
import { InspectionStepper, type InspectionStep } from './inspection-stepper'
import { AdditionalStep } from './steps/additional-step'
import { MarketStep } from './steps/market-step'
import { VehicleStep } from './steps/vehicle-step'

type VehicleErrors = Partial<Record<keyof VehicleSlice, true>>
type MarketErrors = Partial<Record<keyof MarketSlice, true>>
type AdditionalErrors = Partial<Record<keyof AdditionalSlice, true>>

type FormErrorCode =
  | 'generic'
  | 'unauthorized'
  | 'fileTooLarge'
  | 'fileType'
  | 'uploadFailed'

const ATTACHMENT_BUCKET = 'inspection-attachments'

function isSuccess(
  body: CreateInspectionRequestResponse
): body is CreateInspectionRequestSuccess {
  return 'data' in body
}

function generateAttachmentPath(userId: string, file: File): string {
  const safeName = file.name.replace(/[^\w.\-]+/g, '_')
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${userId}/${id}/${safeName}`
}

export function NewInspectionRequestForm() {
  const router = useRouter()
  const t = useTranslations('InspectionRequest')
  const [isPending, startTransition] = useTransition()

  const [step, setStep] = useState<InspectionStep>(1)

  const [vehicle, setVehicle] = useState<VehicleSlice>({
    vehicle_plate: '',
    vehicle_year: '',
    vehicle_model: '',
  })
  const [vehicleErrors, setVehicleErrors] = useState<VehicleErrors>({})

  const [market, setMarket] = useState<{
    inspection_type: InspectionType | ''
    inspection_location: string
  }>({
    inspection_type: '',
    inspection_location: '',
  })
  const [marketErrors, setMarketErrors] = useState<MarketErrors>({})

  const [notes, setNotes] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [additionalErrors, setAdditionalErrors] = useState<AdditionalErrors>({})

  const [formError, setFormError] = useState<FormErrorCode | null>(null)

  function handleVehicleChange(field: keyof VehicleSlice, value: string) {
    setVehicle((prev) => ({ ...prev, [field]: value }))
    if (vehicleErrors[field]) {
      setVehicleErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function handleMarketChange<K extends keyof MarketSlice>(
    field: K,
    value: MarketSlice[K]
  ) {
    setMarket((prev) => ({ ...prev, [field]: value }))
    if (marketErrors[field]) {
      setMarketErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function handleNotesChange(value: string) {
    setNotes(value)
    if (additionalErrors.notes) {
      setAdditionalErrors((prev) => ({ ...prev, notes: undefined }))
    }
  }

  function handleAttachmentChange(file: File | null) {
    setAttachment(file)
    if (formError === 'fileTooLarge' || formError === 'fileType') {
      setFormError(null)
    }
  }

  function handleAttachmentError(error: FileInputError) {
    setFormError(error)
    setAttachment(null)
  }

  function validateVehicle(): boolean {
    const result = vehicleSlice.safeParse(vehicle)
    if (result.success) {
      setVehicleErrors({})
      return true
    }
    const errors: VehicleErrors = {}
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof VehicleSlice | undefined
      if (key) {
        errors[key] = true
      }
    }
    setVehicleErrors(errors)
    return false
  }

  function validateMarket(): boolean {
    const result = marketSlice.safeParse(market)
    if (result.success) {
      setMarketErrors({})
      return true
    }
    const errors: MarketErrors = {}
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof MarketSlice | undefined
      if (key) {
        errors[key] = true
      }
    }
    setMarketErrors(errors)
    return false
  }

  function validateAdditional(): boolean {
    const result = additionalSlice.safeParse({
      notes,
      client_document_path: undefined,
    })
    if (result.success) {
      setAdditionalErrors({})
      return true
    }
    const errors: AdditionalErrors = {}
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof AdditionalSlice | undefined
      if (key) {
        errors[key] = true
      }
    }
    setAdditionalErrors(errors)
    return false
  }

  function handleNext() {
    if (step === 1) {
      if (validateVehicle()) {
        setStep(2)
      }
      return
    }
    if (step === 2) {
      if (validateMarket()) {
        setStep(3)
      }
      return
    }
  }

  function handleBack() {
    if (step === 1) {
      router.push('/')
      return
    }
    setStep((prev) => (prev === 3 ? 2 : 1))
  }

  function handleCancel() {
    router.push('/')
  }

  async function uploadAttachment(file: File): Promise<string> {
    const supabase = createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      throw new Error('unauthorized')
    }

    const path = generateAttachmentPath(userData.user.id, file)
    const { error: uploadError } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      throw new Error('uploadFailed')
    }
    return path
  }

  function handleSubmit() {
    if (!validateAdditional()) {
      return
    }

    setFormError(null)
    startTransition(async () => {
      let attachmentPath: string | undefined
      if (attachment) {
        try {
          attachmentPath = await uploadAttachment(attachment)
        } catch (error) {
          if (error instanceof Error && error.message === 'unauthorized') {
            setFormError('unauthorized')
            return
          }
          setFormError('uploadFailed')
          return
        }
      }

      const trimmedNotes = notes.trim()
      const payload = {
        vehicle_plate: vehicle.vehicle_plate.trim(),
        vehicle_year: vehicle.vehicle_year.trim(),
        vehicle_model: vehicle.vehicle_model.trim(),
        inspection_type: market.inspection_type,
        inspection_location: market.inspection_location.trim(),
        notes: trimmedNotes.length > 0 ? trimmedNotes : undefined,
        client_document_path: attachmentPath,
        status: 'pending' as const,
      }

      let response: Response
      try {
        response = await fetch('/api/inspection/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch {
        setFormError('generic')
        return
      }

      const body = (await response.json().catch(() => null)) as
        | CreateInspectionRequestResponse
        | null

      if (!response.ok || !body || !isSuccess(body)) {
        if (response.status === 401) {
          setFormError('unauthorized')
          return
        }
        const code = body
          ? (body as ApiErrorBody).error?.code
          : undefined
        setFormError(code === 'unauthorized' ? 'unauthorized' : 'generic')
        return
      }

      router.push('/')
    })
  }

  const isLastStep = step === 3
  const submitting = isPending

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[1.65rem]">
          {t('title')}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-[0.9375rem]">
          {t('subtitle')}
        </p>
      </header>

      <InspectionStepper current={step} />

      {formError ? (
        <p
          className="rounded-2xl border border-destructive/35 bg-destructive/6 px-3.5 py-2.5 text-sm leading-snug text-destructive"
          role="alert"
        >
          {t(`errors.${formError}`)}
        </p>
      ) : null}

      <div className="flex flex-1 flex-col gap-5">
        {step === 1 ? (
          <VehicleStep
            errors={vehicleErrors}
            onChange={handleVehicleChange}
            values={vehicle}
          />
        ) : null}
        {step === 2 ? (
          <MarketStep
            errors={marketErrors}
            onChange={handleMarketChange}
            values={market as MarketSlice}
          />
        ) : null}
        {step === 3 ? (
          <AdditionalStep
            errors={additionalErrors}
            onAttachmentChange={handleAttachmentChange}
            onAttachmentError={handleAttachmentError}
            onNotesChange={handleNotesChange}
            values={{ notes, attachment }}
          />
        ) : null}
      </div>

      <div className="sticky bottom-0 -mx-5 mt-auto flex gap-3 border-t border-black/[0.045] bg-card/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button
          className="h-12 flex-1 rounded-xl border-0 bg-brand-auth-soft/80 text-brand-auth-soft-foreground hover:bg-brand-auth-soft"
          disabled={submitting}
          onClick={step === 1 ? handleCancel : handleBack}
          type="button"
          variant="secondary"
        >
          {step === 1 ? t('actions.cancel') : t('actions.back')}
        </Button>
        <Button
          className="h-12 flex-1 rounded-xl bg-brand-auth text-base font-semibold text-brand-auth-foreground shadow-[0_16px_40px_-24px_rgb(37_112_216_/_90%)] hover:bg-brand-auth hover:brightness-[1.04] disabled:brightness-95"
          disabled={submitting}
          onClick={isLastStep ? handleSubmit : handleNext}
          type="button"
        >
          {isLastStep
            ? submitting
              ? t('actions.submitting')
              : t('actions.submit')
            : t('actions.next')}
        </Button>
      </div>
    </div>
  )
}
