'use client'

import { Loader2, MapPin } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'

import { useAddressSearch } from '../hooks/use-address-search'

type AddressSearchProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  searchingLabel?: string
  noResultsLabel?: string
}

export function AddressSearch({
  id,
  value,
  onChange,
  placeholder,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  searchingLabel = 'Buscando endereços...',
  noResultsLabel = 'Nenhum endereço encontrado',
}: AddressSearchProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const { data: suggestions = [], isFetching, isFetched } = useAddressSearch(value)

  const showDropdown =
    open && value.trim().length >= 3 && (isFetching || suggestions.length > 0 || isFetched)

  function updateDropdownPosition() {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    })
  }

  useEffect(() => {
    if (!showDropdown) return
    updateDropdownPosition()
    window.addEventListener('scroll', updateDropdownPosition, true)
    window.addEventListener('resize', updateDropdownPosition)
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true)
      window.removeEventListener('resize', updateDropdownPosition)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDropdown])

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    onChange(val)
    setActiveIndex(-1)
    setOpen(val.trim().length >= 3)
  }

  function handleSelect(label: string) {
    onChange(label)
    setOpen(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex].label)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const dropdown = showDropdown ? (
    <ul
      className="z-[9999] max-h-64 overflow-y-auto rounded-xl border border-border bg-card shadow-md"
      id={listId}
      role="listbox"
      style={dropdownStyle}
    >
      {isFetching && suggestions.length === 0 ? (
        <li className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          {searchingLabel}
        </li>
      ) : suggestions.length === 0 ? (
        <li className="px-4 py-3 text-sm text-muted-foreground">{noResultsLabel}</li>
      ) : (
        suggestions.map((s, i) => (
          <li
            key={s.id}
            id={`${listId}-opt-${i}`}
            aria-selected={i === activeIndex}
            className={cn(
              'flex cursor-pointer items-start gap-3 px-4 py-3 text-sm transition-colors',
              i === activeIndex ? 'bg-brand-auth-soft text-brand-auth' : 'hover:bg-muted'
            )}
            onClick={() => handleSelect(s.label)}
            onMouseEnter={() => setActiveIndex(i)}
            role="option"
          >
            <MapPin
              aria-hidden
              className="mt-0.5 size-3.5 shrink-0 text-brand-auth-muted"
              strokeWidth={2}
            />
            <span className="leading-snug">{s.label}</span>
          </li>
        ))
      )}
    </ul>
  ) : null

  return (
    <div className="relative" ref={containerRef}>
      <MapPin
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 z-10 size-[1.1rem] -translate-y-1/2 text-brand-auth-muted"
        strokeWidth={2}
      />
      {isFetching ? (
        <Loader2
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 z-10 size-4 -translate-y-1/2 animate-spin text-brand-auth-muted"
        />
      ) : null}
      <input
        id={id}
        aria-autocomplete="list"
        aria-controls={showDropdown ? listId : undefined}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined}
        aria-describedby={ariaDescribedBy}
        aria-expanded={showDropdown}
        aria-invalid={ariaInvalid}
        autoComplete="off"
        className={cn(
          'h-12 w-full rounded-xl border-0 bg-brand-auth-soft/90 pl-[2.625rem] pr-10 text-base shadow-none outline-none transition-[box-shadow] placeholder:text-brand-auth-muted/80 focus-visible:ring-[3px] focus-visible:ring-brand-auth/18 sm:h-[3.125rem]',
          ariaInvalid && 'ring-[3px] ring-destructive/20'
        )}
        name="inspection_location"
        onChange={handleChange}
        onFocus={() => value.trim().length >= 3 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        role="combobox"
        type="text"
        value={value}
      />
      {typeof document !== 'undefined' ? createPortal(dropdown, document.body) : null}
    </div>
  )
}
