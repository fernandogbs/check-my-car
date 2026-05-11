'use client'

import { useActionState, useState } from 'react'
import {
  Car,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserCog,
  UserRound,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { signInWithEmailPassword } from '../application/sign-in-email-password-action'
import { signInWithGoogle } from '../application/sign-in-google-action'
import {
  type AuthActionState,
  initialAuthActionState,
} from '../model/auth-action-state'

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

type LoginRole = 'buyer' | 'inspector'

type LoginFormProps = {
  locale: string
  urlError?: 'oauth' | 'callback'
}

export function LoginForm({ locale, urlError }: LoginFormProps) {
  const t = useTranslations('Auth')
  const [role, setRole] = useState<LoginRole>('buyer')
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

          <fieldset className="m-0 min-w-0 space-y-2.5 border-0 p-0">
            <legend className="text-[0.9375rem] font-medium text-[#2c3f5c]">
              {t('roleLabel')}
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { id: 'buyer' as const, label: 'roleBuyer', Icon: UserRound },
                  {
                    id: 'inspector' as const,
                    label: 'roleInspector',
                    Icon: UserCog,
                  },
                ] as const
              ).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={role === id}
                  onClick={() => {
                    setRole(id)
                  }}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-transparent px-4 py-4 text-sm font-semibold transition-[background-color,color,transform,box-shadow,border-color] outline-none select-none hover:brightness-[1.03] active:translate-y-[0.02rem] active:brightness-[0.98] sm:rounded-2xl sm:py-5',
                    role === id
                      ? 'border-brand-auth/85 bg-brand-auth text-brand-auth-foreground shadow-[0_14px_32px_-16px_rgb(37_112_216_/_75%)]'
                      : 'bg-brand-auth-soft/75 text-brand-auth-soft-foreground'
                  )}
                >
                  <Icon
                    aria-hidden
                    className={cn(
                      'size-[1.4rem]',
                      role === id
                        ? 'text-brand-auth-foreground'
                        : 'text-brand-auth-muted'
                    )}
                    strokeWidth={2}
                  />
                  {t(label)}
                </button>
              ))}
            </div>
          </fieldset>

          <form action={emailFormAction} className="space-y-5">
            <input name="locale" type="hidden" value={locale} />
            <input name="role" type="hidden" value={role} />

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

          {/* TODO: Add supabase Google and Apple sign in */}
          {/* <div className="relative pt-2">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-brand-auth-soft" />
            <p className="relative mx-auto w-max bg-card px-3 text-center text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-brand-auth-muted">
              {t('orContinueWith')}
            </p>
          </div>

          <div className="flex items-center justify-center gap-7 pt-2">
            <form action={signInWithGoogle} className="contents">
              <input name="locale" type="hidden" value={locale} />
              <Button
                aria-label={t('signInWithGoogleAria')}
                className="relative size-[3.5rem] shrink-0 rounded-full border-[1.5px] border-transparent bg-brand-auth-soft/95 p-0 text-[#4285f4] shadow-inner shadow-white/30 transition-[border-color,box-shadow] hover:border-brand-auth/20 hover:bg-white active:translate-y-[0.06rem]"
                size="icon-lg"
                type="submit"
                variant="outline"
              >
                <GoogleGlyph className="size-[1.35rem]" />
              </Button>
            </form>
            <button
              aria-label={t('signInWithAppleAria')}
              disabled
              className="relative flex size-[3.5rem] shrink-0 cursor-not-allowed items-center justify-center rounded-full border-[1.5px] border-black/[0.06] bg-brand-auth-soft/90 text-[#172339]/90 backdrop-blur-sm"
              title={t('signInWithAppleSoon')}
              type="button"
            >
              <span className="text-[0.65rem] font-bold leading-none tracking-[0.14em]">
                iOS
              </span>
            </button>
          </div> */}
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
