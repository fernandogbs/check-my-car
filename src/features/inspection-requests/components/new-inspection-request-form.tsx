'use client'

import { useTranslations } from 'next-intl'
import { useMutation } from '@tanstack/react-query'

import { Button } from '@/shared/components/ui/button'
import type { FileInputError } from '@/shared/components/ui/file-input'
import { useRouter } from '@/i18n/navigation'
import { useClearFormOnUnmount } from '@/features/inspection-requests/hooks/use-clear-form-on-unmount'

import {
  additionalSlice,
  marketSlice,
  vehicleSlice,
  type AdditionalSlice,
  type MarketSlice,
  type VehicleSlice,
} from '../types/inspection-request-schema'
import type {
  ApiErrorBody,
  CreateInspectionRequestResponse,
  CreateInspectionRequestSuccess,
} from '../types/inspection-request-api'
import {
  useInspectionFormStore,
  type FormErrorCode,
  type InspectionStep,
} from '../stores/inspection-form.store'
import { InspectionStepper } from './inspection-stepper'
import { AdditionalStep } from './steps/additional-step'
import { MarketStep } from './steps/market-step'
import { VehicleStep } from './steps/vehicle-step'

function isSuccess(
  body: CreateInspectionRequestResponse,
): body is CreateInspectionRequestSuccess {
  return 'data' in body
}

async function uploadAttachment(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/inspection/attachments', {
    method: 'POST',
    body: formData,
  })

  if (response.status === 401) throw new Error('unauthorized')
  if (!response.ok) throw new Error('uploadFailed')

  const body = await response.json().catch(() => null)
  if (!body?.path) throw new Error('uploadFailed')

  return body.path
}

type SubmitPayload = {
  vehicle: VehicleSlice
  market: { inspection_type: string; inspection_location: string }
  notes: string
  attachment: File | null
}

async function submitInspectionRequest(payload: SubmitPayload): Promise<void> {
  let attachmentPath: string | undefined
  if (payload.attachment) {
    attachmentPath = await uploadAttachment(payload.attachment)
  }

  const trimmedNotes = payload.notes.trim()
  const body = {
    vehicle_plate: payload.vehicle.vehicle_plate.trim(),
    vehicle_year: payload.vehicle.vehicle_year.trim(),
    vehicle_model: payload.vehicle.vehicle_model.trim(),
    inspection_type: payload.market.inspection_type,
    inspection_location: payload.market.inspection_location.trim(),
    notes: trimmedNotes.length > 0 ? trimmedNotes : undefined,
    client_document_path: attachmentPath,
    status: 'pending' as const,
  }

  const response = await fetch('/api/inspection/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const responseBody = (await response.json().catch(() => null)) as
    | CreateInspectionRequestResponse
    | null

  if (!response.ok || !responseBody || !isSuccess(responseBody)) {
    if (response.status === 401) throw new Error('unauthorized')
    const code = responseBody ? (responseBody as ApiErrorBody).error?.code : undefined
    throw new Error(code === 'unauthorized' ? 'unauthorized' : 'generic')
  }
}

export function NewInspectionRequestForm() {
  const router = useRouter()
  const t = useTranslations('InspectionRequest')

  const {
    step,
    vehicle,
    vehicleErrors,
    market,
    marketErrors,
    notes,
    attachment,
    additionalErrors,
    formError,
    setStep,
    setVehicleField,
    setVehicleErrors,
    setMarketField,
    setMarketErrors,
    setNotes,
    setAttachment,
    setAdditionalErrors,
    setFormError,
    reset,
  } = useInspectionFormStore()

  // Limpar store ao desmontar o componente (usuário sai do form ou desloga)
  useClearFormOnUnmount()

  const { mutate, isPending } = useMutation({
    mutationFn: submitInspectionRequest,
    onSuccess: () => {
      reset()
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      const code = error.message as FormErrorCode
      setFormError(['generic', 'unauthorized', 'uploadFailed'].includes(code) ? code : 'generic')
    },
  })

  function validateVehicle(): boolean {
    const result = vehicleSlice.safeParse(vehicle)
    if (result.success) {
      setVehicleErrors({})
      return true
    }
    const errors: Partial<Record<keyof VehicleSlice, true>> = {}
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof VehicleSlice | undefined
      if (key) errors[key] = true
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
    const errors: Partial<Record<keyof MarketSlice, true>> = {}
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof MarketSlice | undefined
      if (key) errors[key] = true
    }
    setMarketErrors(errors)
    return false
  }

  function validateAdditional(): boolean {
    const result = additionalSlice.safeParse({ notes, client_document_path: undefined })
    if (result.success) {
      setAdditionalErrors({})
      return true
    }
    const errors: Partial<Record<keyof AdditionalSlice, true>> = {}
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof AdditionalSlice | undefined
      if (key) errors[key] = true
    }
    setAdditionalErrors(errors)
    return false
  }

  function handleNext() {
    if (step === 1 && validateVehicle()) setStep(2)
    else if (step === 2 && validateMarket()) setStep(3)
  }

  function handleBack() {
    if (step === 1) {
      router.push('/dashboard')
      return
    }
    setStep((step === 3 ? 2 : 1) as InspectionStep)
  }

  function handleSubmit() {
    if (!validateAdditional()) return
    setFormError(null)
    mutate({ vehicle, market, notes, attachment })
  }

  function handleAttachmentError(error: FileInputError) {
    setFormError(error)
    setAttachment(null)
  }

  const isLastStep = step === 3

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[1.65rem]">
          {t('title')}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-[0.9375rem]">{t('subtitle')}</p>
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
          <VehicleStep errors={vehicleErrors} onChange={setVehicleField} values={vehicle} />
        ) : null}
        {step === 2 ? (
          <MarketStep
            errors={marketErrors}
            onChange={setMarketField}
            values={market as MarketSlice}
          />
        ) : null}
        {step === 3 ? (
          <AdditionalStep
            errors={additionalErrors}
            onAttachmentChange={setAttachment}
            onAttachmentError={handleAttachmentError}
            onNotesChange={setNotes}
            values={{ notes, attachment }}
          />
        ) : null}
      </div>

      <div className="sticky bottom-0 -mx-5 mt-auto flex gap-3 border-t border-black/[0.045] px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button
          className="h-12 flex-1 rounded-xl border-0 bg-brand-auth-soft/100 text-brand-auth-soft-foreground hover:bg-brand-auth-soft"
          disabled={isPending}
          onClick={step === 1 ? () => router.push('/dashboard') : handleBack}
          type="button"
          variant="secondary"
        >
          {step === 1 ? t('actions.cancel') : t('actions.back')}
        </Button>
        <Button
          className="h-12 flex-1 rounded-xl bg-brand-auth text-base font-semibold text-brand-auth-foreground shadow-[0_16px_40px_-24px_rgb(37_112_216_/_90%)] hover:bg-brand-auth hover:brightness-[1.04] disabled:brightness-95"
          disabled={isPending}
          onClick={isLastStep ? handleSubmit : handleNext}
          type="button"
        >
          {isLastStep
            ? isPending
              ? t('actions.submitting')
              : t('actions.submit')
            : t('actions.next')}
        </Button>
      </div>
    </div>
  )
}
