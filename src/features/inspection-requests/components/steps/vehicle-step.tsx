'use client'

import { Car } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

import type { VehicleSlice } from '../../types/inspection-request-schema'

type FieldErrors = Partial<Record<keyof VehicleSlice, true>>

type VehicleStepProps = {
  values: VehicleSlice
  errors: FieldErrors
  onChange: (field: keyof VehicleSlice, value: string) => void
}

export function VehicleStep({ values, errors, onChange }: VehicleStepProps) {
  const t = useTranslations('InspectionRequest.vehicle')
  const tValidation = useTranslations('InspectionRequest.validation')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[1.05rem] font-semibold text-foreground">
          <Car aria-hidden className="size-5 text-brand-auth" strokeWidth={2} />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label
            className="text-[0.9375rem] font-medium text-foreground"
            htmlFor="vehicle_plate"
          >
            {t('plate.label')}
          </Label>
          <Input
            aria-describedby={errors.vehicle_plate ? 'vehicle_plate-error' : undefined}
            aria-invalid={errors.vehicle_plate ? true : undefined}
            autoComplete="off"
            className="h-12 rounded-xl border-0 bg-brand-auth-soft/90 px-4 shadow-none ring-0 placeholder:text-brand-auth-muted/80 focus-visible:ring-[3px] focus-visible:ring-brand-auth/18 sm:h-[3.125rem]"
            id="vehicle_plate"
            name="vehicle_plate"
            onChange={(event) => onChange('vehicle_plate', event.target.value)}
            placeholder={t('plate.placeholder')}
            value={values.vehicle_plate}
          />
          {errors.vehicle_plate ? (
            <p
              className="text-xs leading-snug text-destructive"
              id="vehicle_plate-error"
            >
              {tValidation('plateRequired')}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label
            className="text-[0.9375rem] font-medium text-foreground"
            htmlFor="vehicle_year"
          >
            {t('year.label')}
          </Label>
          <Input
            aria-describedby={errors.vehicle_year ? 'vehicle_year-error' : undefined}
            aria-invalid={errors.vehicle_year ? true : undefined}
            autoComplete="off"
            className="h-12 rounded-xl border-0 bg-brand-auth-soft/90 px-4 shadow-none ring-0 placeholder:text-brand-auth-muted/80 focus-visible:ring-[3px] focus-visible:ring-brand-auth/18 sm:h-[3.125rem]"
            id="vehicle_year"
            inputMode="numeric"
            name="vehicle_year"
            onChange={(event) => onChange('vehicle_year', event.target.value)}
            placeholder={t('year.placeholder')}
            value={values.vehicle_year}
          />
          {errors.vehicle_year ? (
            <p
              className="text-xs leading-snug text-destructive"
              id="vehicle_year-error"
            >
              {tValidation('yearRequired')}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label
            className="text-[0.9375rem] font-medium text-foreground"
            htmlFor="vehicle_model"
          >
            {t('makeModel.label')}
          </Label>
          <Input
            aria-describedby={errors.vehicle_model ? 'vehicle_model-error' : undefined}
            aria-invalid={errors.vehicle_model ? true : undefined}
            autoComplete="off"
            className="h-12 rounded-xl border-0 bg-brand-auth-soft/90 px-4 shadow-none ring-0 placeholder:text-brand-auth-muted/80 focus-visible:ring-[3px] focus-visible:ring-brand-auth/18 sm:h-[3.125rem]"
            id="vehicle_model"
            name="vehicle_model"
            onChange={(event) => onChange('vehicle_model', event.target.value)}
            placeholder={t('makeModel.placeholder')}
            value={values.vehicle_model}
          />
          {errors.vehicle_model ? (
            <p
              className="text-xs leading-snug text-destructive"
              id="vehicle_model-error"
            >
              {tValidation('makeModelRequired')}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
