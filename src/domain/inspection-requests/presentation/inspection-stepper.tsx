'use client'

import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

export type InspectionStep = 1 | 2 | 3

type InspectionStepperProps = {
  current: InspectionStep
}

const stepKeys = ['vehicle', 'market', 'additional'] as const

export function InspectionStepper({ current }: InspectionStepperProps) {
  const t = useTranslations('InspectionRequest.stepper')

  return (
    <ol
      aria-label="Progress"
      className="flex items-start justify-between gap-2"
    >
      {stepKeys.map((key, index) => {
        const stepNumber = (index + 1) as InspectionStep
        const isActive = stepNumber === current
        const isCompleted = stepNumber < current
        const isLast = index === stepKeys.length - 1

        return (
          <li
            key={key}
            aria-current={isActive ? 'step' : undefined}
            className="flex flex-1 items-start gap-2"
          >
            <div className="flex flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  'flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  isActive &&
                    'bg-brand-auth text-brand-auth-foreground shadow-[0_10px_24px_-12px_rgb(37_112_216_/_75%)]',
                  isCompleted &&
                    'bg-brand-auth/12 text-brand-auth ring-1 ring-brand-auth/30',
                  !isActive &&
                    !isCompleted &&
                    'bg-brand-auth-soft text-brand-auth-muted'
                )}
              >
                {isCompleted ? (
                  <Check aria-hidden className="size-4" strokeWidth={2.5} />
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive
                    ? 'text-brand-auth'
                    : isCompleted
                      ? 'text-brand-auth/70'
                      : 'text-brand-auth-muted'
                )}
              >
                {t(key)}
              </span>
            </div>
            {!isLast ? (
              <div
                aria-hidden
                className={cn(
                  'mt-4 h-px flex-1 self-start',
                  isCompleted ? 'bg-brand-auth/40' : 'bg-brand-auth-soft'
                )}
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
