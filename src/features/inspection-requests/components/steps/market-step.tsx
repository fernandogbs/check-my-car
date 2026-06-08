'use client'

import { Briefcase, ShieldCheck, RefreshCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Label } from '@/shared/components/ui/label'
import { RadioGroup, RadioItem } from '@/shared/components/ui/radio-group'
import { cn } from '@/lib/utils'

import { AddressSearch } from '../address-search'
import type { InspectionType } from '../../types/inspection-type'
import type { MarketSlice } from '../../types/inspection-request-schema'

type FieldErrors = Partial<Record<keyof MarketSlice, true>>

type MarketStepProps = {
  values: MarketSlice
  errors: FieldErrors
  onChange: <K extends keyof MarketSlice>(field: K, value: MarketSlice[K]) => void
}

export function MarketStep({ values, errors, onChange }: MarketStepProps) {
  const t = useTranslations('InspectionRequest.market')
  const tValidation = useTranslations('InspectionRequest.validation')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[1.05rem] font-semibold text-foreground">
          <Briefcase
            aria-hidden
            className="size-5 text-brand-auth"
            strokeWidth={2}
          />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <fieldset
          aria-describedby={errors.inspection_type ? 'inspection_type-error' : undefined}
          className="space-y-2.5"
        >
          <legend className="text-[0.9375rem] font-medium text-foreground">
            {t('type.label')}
          </legend>
          <RadioGroup<InspectionType>
            aria-invalid={errors.inspection_type ? true : undefined}
            className="grid grid-cols-2 gap-3"
            onValueChange={(value) => onChange('inspection_type', value)}
            value={values.inspection_type as InspectionType | undefined}
          >
            <RadioItem
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 border-transparent bg-brand-auth-soft/75 px-3 py-4 text-sm font-semibold text-brand-auth-soft-foreground transition-colors',
                values.inspection_type === 'cautelar' &&
                  'border-brand-auth bg-brand-auth/8 text-brand-auth'
              )}
              value="cautelar"
            >
              <ShieldCheck
                aria-hidden
                className="size-5"
                strokeWidth={2}
              />
              {t('type.cautelar')}
            </RadioItem>
            <RadioItem
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 border-transparent bg-brand-auth-soft/75 px-3 py-4 text-sm font-semibold text-brand-auth-soft-foreground transition-colors',
                values.inspection_type === 'transferencia' &&
                  'border-brand-auth bg-brand-auth/8 text-brand-auth'
              )}
              value="transferencia"
            >
              <RefreshCcw aria-hidden className="size-5" strokeWidth={2} />
              {t('type.transferencia')}
            </RadioItem>
          </RadioGroup>
          {errors.inspection_type ? (
            <p
              className="text-xs leading-snug text-destructive"
              id="inspection_type-error"
            >
              {tValidation('typeRequired')}
            </p>
          ) : null}
        </fieldset>

        <div className="space-y-2">
          <Label
            className="text-[0.9375rem] font-medium text-foreground"
            htmlFor="inspection_location"
          >
            {t('location.label')}
          </Label>
          <AddressSearch
            aria-describedby={
              errors.inspection_location ? 'inspection_location-error' : undefined
            }
            aria-invalid={errors.inspection_location ? true : undefined}
            id="inspection_location"
            noResultsLabel={t('location.noResults')}
            onChange={(value) => onChange('inspection_location', value)}
            placeholder={t('location.placeholder')}
            searchingLabel={t('location.searching')}
            value={values.inspection_location}
          />
          {errors.inspection_location ? (
            <p
              className="text-xs leading-snug text-destructive"
              id="inspection_location-error"
            >
              {tValidation('locationRequired')}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
