'use client'

import * as React from 'react'
import { Radio } from '@base-ui/react/radio'
import {
  RadioGroup as RadioGroupPrimitive,
  type RadioGroupProps,
} from '@base-ui/react/radio-group'

import { cn } from '@/lib/utils'

function RadioGroup<TValue = string>({
  className,
  ...props
}: RadioGroupProps<TValue>) {
  return (
    <RadioGroupPrimitive<TValue>
      data-slot="radio-group"
      className={cn('grid gap-3', className)}
      {...props}
    />
  )
}

type RadioItemProps = React.ComponentProps<typeof Radio.Root>

function RadioItem({ className, children, ...props }: RadioItemProps) {
  return (
    <Radio.Root
      data-slot="radio-item"
      className={cn(
        'group/radio-item flex cursor-pointer items-center gap-3 rounded-xl border border-input bg-card px-4 py-3 text-sm font-medium text-foreground shadow-xs transition-colors outline-none select-none hover:border-ring/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-[checked]:border-brand-auth data-[checked]:bg-brand-auth/8 data-[checked]:text-brand-auth data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </Radio.Root>
  )
}

function RadioIndicator({
  className,
  ...props
}: React.ComponentProps<typeof Radio.Indicator>) {
  return (
    <Radio.Indicator
      data-slot="radio-indicator"
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-input bg-card transition-colors group-data-[checked]/radio-item:border-brand-auth group-data-[checked]/radio-item:bg-brand-auth',
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-brand-auth-foreground opacity-0 transition-opacity group-data-[checked]/radio-item:opacity-100"
      />
    </Radio.Indicator>
  )
}

export { RadioGroup, RadioItem, RadioIndicator }
