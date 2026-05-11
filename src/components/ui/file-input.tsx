'use client'

import * as React from 'react'
import { FileText, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const FILE_INPUT_MAX_BYTES = 10 * 1024 * 1024 // 10 MB
export const FILE_INPUT_ALLOWED_MIME = ['application/pdf', 'image/jpeg'] as const

export type FileInputError = 'fileTooLarge' | 'fileType'

type FileInputProps = {
  id?: string
  title: string
  subtitle: string
  cta: string
  selectedLabel: string
  changeLabel: string
  removeLabel: string
  value?: File | null
  onChange?: (file: File | null) => void
  onValidationError?: (error: FileInputError) => void
  maxBytes?: number
  acceptMime?: readonly string[]
  className?: string
  disabled?: boolean
}

function FileInput({
  id,
  title,
  subtitle,
  cta,
  selectedLabel,
  changeLabel,
  removeLabel,
  value,
  onChange,
  onValidationError,
  maxBytes = FILE_INPUT_MAX_BYTES,
  acceptMime = FILE_INPUT_ALLOWED_MIME,
  className,
  disabled,
}: FileInputProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const reactId = React.useId()
  const inputId = id ?? `file-input-${reactId}`

  function handleSelectClick() {
    inputRef.current?.click()
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null

    if (!file) {
      onChange?.(null)
      return
    }

    if (!acceptMime.includes(file.type)) {
      onValidationError?.('fileType')
      event.target.value = ''
      return
    }

    if (file.size > maxBytes) {
      onValidationError?.('fileTooLarge')
      event.target.value = ''
      return
    }

    onChange?.(file)
  }

  function handleRemove() {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onChange?.(null)
  }

  if (value) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl border border-input bg-card px-4 py-3 shadow-xs',
          className
        )}
      >
        <FileText
          aria-hidden
          className="size-9 shrink-0 rounded-lg bg-brand-auth/10 p-2 text-brand-auth"
          strokeWidth={2}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {value.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedLabel} ·{' '}
            {Math.max(1, Math.round(value.size / 1024))} KB
          </p>
        </div>
        <input
          ref={inputRef}
          aria-hidden="true"
          accept={acceptMime.join(',')}
          className="sr-only"
          id={inputId}
          onChange={handleChange}
          tabIndex={-1}
          type="file"
        />
        <Button
          aria-label={removeLabel}
          disabled={disabled}
          onClick={handleRemove}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <X aria-hidden className="size-4" />
        </Button>
        <Button
          disabled={disabled}
          onClick={handleSelectClick}
          size="sm"
          type="button"
          variant="outline"
        >
          {changeLabel}
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-dashed border-input bg-card/60 px-4 py-3 shadow-xs',
        className
      )}
    >
      <FileText
        aria-hidden
        className="size-9 shrink-0 rounded-lg bg-brand-auth/10 p-2 text-brand-auth"
        strokeWidth={2}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <input
        ref={inputRef}
        accept={acceptMime.join(',')}
        className="sr-only"
        id={inputId}
        onChange={handleChange}
        type="file"
      />
      <Button
        disabled={disabled}
        onClick={handleSelectClick}
        size="sm"
        type="button"
        variant="default"
      >
        {cta}
      </Button>
    </div>
  )
}

export { FileInput }
