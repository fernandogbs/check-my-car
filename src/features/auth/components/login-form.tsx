'use client'

import { useActionState, useState } from 'react'
import {
  Car,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { signInWithEmailPassword } from '../services/actions/sign-in-email-password-action'
import {
  type AuthActionState,
  initialAuthActionState,
} from '../types/auth-action-state'

type LoginFormProps = {
  locale: string
  urlError?: 'oauth' | 'callback'
}

export function LoginForm({ locale, urlError }: LoginFormProps) {
  const t = useTranslations('Auth')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [state, emailFormAction, emailPending] = useActionState<
    AuthActionState,
    FormData
  >(signInWithEmailPassword, initialAuthActionState)

  return (
    <div className="flex min-h-full flex-1 flex-col px-6 pb-10 pt-8 sm:mx-auto sm:w-full sm:max-w-lg sm:pb-14 sm:pt-12">
      <header className="mb-10 flex shrink-0 items-center gap-2 sm:gap-3">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl text-brand-auth sm:size-12"
          style={{
            background:
              'color-mix(in oklch, var(--brand-auth) 14%, transparent)',
          }}
        >
          <Car aria-hidden className="size-[1.375rem] sm:size-6" strokeWidth={2.25} />
        </div>
        <span className="text-xl font-bold tracking-tight text-brand-auth sm:text-[1.35rem]">
          {t('brandName')}
        </span>
      </header>

      <div className="rounded-[1.6rem] border border-black/[0.045] bg-card px-6 py-9 shadow-[0_28px_80px_-32px_rgb(37_112_216_/_42%)] sm:rounded-[1.75rem] sm:px-10 sm:py-10">
        <div className="mb-9 space-y-2 text-center sm:mb-10">
          <h1 className="text-[1.65rem] font-bold leading-snug tracking-tight text-[#172339] sm:text-[1.85rem]">
            {t('pageTitle')}
          </h1>
          <p className="mx-auto max-w-sm text-[0.9375rem] leading-relaxed text-brand-auth-muted">
            {t('pageDescription')}
          </p>
        </div>

        <div className="space-y-7">
          {urlError === 'oauth' ? (
            <p className="rounded-2xl border border-destructive/35 bg-destructive/6 px-3.5 py-2.5 text-sm leading-snug text-destructive">
              {t('errors.oauthRedirect')}
            </p>
          ) : null}
          {urlError === 'callback' ? (
            <p className="rounded-2xl border border-destructive/35 bg-destructive/6 px-3.5 py-2.5 text-sm leading-snug text-destructive">
              {t('errors.oauthCallback')}
            </p>
          ) : null}
          {state?.ok === false && state.code === 'invalidCredentials' ? (
            <p className="rounded-2xl border border-destructive/35 bg-destructive/6 px-3.5 py-2.5 text-sm leading-snug text-destructive">
              {t('errors.invalidCredentials')}
            </p>
          ) : null}
          {state?.ok === false && state.code === 'generic' ? (
            <p className="rounded-2xl border border-destructive/35 bg-destructive/6 px-3.5 py-2.5 text-sm leading-snug text-destructive">
              {t('errors.generic')}
            </p>
          ) : null}

          <form action={emailFormAction} className="space-y-5">
            <input name="locale" type="hidden" value={locale} />

            <div className="space-y-2">
              <Label
                className="text-[0.9375rem] font-medium text-[#2c3f5c]"
                htmlFor="email"
              >
                {t('email')}
              </Label>
              <div className="relative flex items-center">
                <Mail
                  aria-hidden
                  className="pointer-events-none absolute left-4 size-[1.1rem] text-brand-auth-muted"
                  strokeWidth={2}
                />
                <Input
                  aria-invalid={state?.fieldErrors?.email ? true : undefined}
                  aria-describedby={state?.fieldErrors?.email ? 'email-error' : undefined}
                  autoComplete="email"
                  className="h-12 rounded-xl border-0 bg-brand-auth-soft/90 pl-[2.625rem] pr-4 shadow-none ring-0 placeholder:text-brand-auth-muted/80 focus-visible:ring-[3px] focus-visible:ring-brand-auth/18 sm:h-[3.125rem]"
                  id="email"
                  name="email"
                  placeholder={t('emailPlaceholder')}
                  required
                  type="email"
                />
              </div>
              {state?.fieldErrors?.email ? (
                <p className="text-xs leading-snug text-destructive" id="email-error">
                  {t('validation.emailInvalid')}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-4">
                <Label
                  className="text-[0.9375rem] font-medium text-[#2c3f5c]"
                  htmlFor="password"
                >
                  {t('password')}
                </Label>
                <Link
                  className="shrink-0 text-sm font-semibold text-brand-auth hover:underline"
                  href="/auth/forgot"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock
                  aria-hidden
                  className="pointer-events-none absolute left-4 size-[1.1rem] text-brand-auth-muted"
                  strokeWidth={2}
                />
                <Input
                  aria-invalid={state?.fieldErrors?.password ? true : undefined}
                  aria-describedby={
                    state?.fieldErrors?.password ? 'password-error' : undefined
                  }
                  autoComplete="current-password"
                  className="h-12 rounded-xl border-0 bg-brand-auth-soft/90 pl-[2.625rem] pr-12 shadow-none ring-0 placeholder:text-brand-auth-muted focus-visible:ring-[3px] focus-visible:ring-brand-auth/18 sm:h-[3.125rem]"
                  id="password"
                  minLength={1}
                  name="password"
                  placeholder={t('passwordPlaceholder')}
                  required
                  type={passwordVisible ? 'text' : 'password'}
                />
                <button
                  aria-label={
                    passwordVisible ? t('hidePassword') : t('showPassword')
                  }
                  aria-pressed={passwordVisible}
                  className="absolute right-3 flex size-8 items-center justify-center rounded-lg text-brand-auth-muted transition-colors hover:bg-black/[0.04] hover:text-brand-auth-soft-foreground active:bg-black/[0.07]"
                  onClick={() => {
                    setPasswordVisible((v) => !v)
                  }}
                  type="button"
                >
                  {passwordVisible ? (
                    <EyeOff className="size-[1.1rem]" strokeWidth={2} />
                  ) : (
                    <Eye className="size-[1.1rem]" strokeWidth={2} />
                  )}
                </button>
              </div>
              {state?.fieldErrors?.password ? (
                <p
                  className="text-xs leading-snug text-destructive"
                  id="password-error"
                >
                  {t('validation.passwordRequired')}
                </p>
              ) : null}
            </div>

            <Button
              className="h-[3rem] w-full rounded-xl bg-brand-auth text-base font-semibold text-brand-auth-foreground shadow-[0_16px_40px_-24px_rgb(37_112_216_/_90%)] transition-[filter] hover:bg-brand-auth hover:brightness-[1.04] disabled:brightness-95 sm:h-[3.25rem] sm:rounded-[0.9375rem]"
              disabled={emailPending}
              type="submit"
            >
              {t('signIn')}
            </Button>
          </form>
        </div>
      </div>

      <footer className="mt-auto flex justify-center pt-14 text-[0.9375rem] text-brand-auth-muted">
        <p>
          <span>{t('noAccountPrompt')} </span>
          <Link
            className="font-semibold text-brand-auth hover:underline"
            href="/auth/register"
          >
            {t('createAccount')}
          </Link>
        </p>
      </footer>
    </div>
  )
}
