'use client'

import { useActionState, useEffect, useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { checkEmail } from '../services/actions/check-email-action'
import { resetPassword } from '../services/actions/reset-password-action'
import {
  type CheckEmailActionState,
  initialCheckEmailActionState,
} from '../types/check-email-action-state'
import {
  type ResetPasswordActionState,
  initialResetPasswordActionState,
} from '../types/reset-password-action-state'

type ResetPasswordFormProps = {
  locale: string
}

export function ResetPasswordForm({ locale }: ResetPasswordFormProps) {
  const t = useTranslations('Auth')
  const tf = useTranslations('Auth.ForgotPage')
  const router = useRouter()
  const [passwordVisible, setPasswordVisible] = useState(false)

  const [emailState, emailFormAction, emailPending] = useActionState<
    CheckEmailActionState,
    FormData
  >(checkEmail, initialCheckEmailActionState)

  const [resetState, resetFormAction, resetPending] = useActionState<
    ResetPasswordActionState,
    FormData
  >(resetPassword, initialResetPasswordActionState)

  const confirmedEmail = emailState?.ok === true ? emailState.email : null

  useEffect(() => {
    if (resetState?.ok === true) {
      toast.success(tf('toastPasswordReset'))
      router.push(`/${locale}/auth/login`)
    }
    if (resetState?.ok === false && resetState.code === 'generic') {
      toast.error(tf('toastError'))
    }
  }, [resetState, locale, router, tf])

  return (
    <div className="flex min-h-full flex-1 flex-col px-6 pb-10 pt-8 sm:mx-auto sm:w-full sm:max-w-lg sm:pb-14 sm:pt-12">
      <div className="rounded-[1.6rem] border border-black/[0.045] bg-card px-6 py-9 shadow-[0_28px_80px_-32px_rgb(37_112_216_/_42%)] sm:rounded-[1.75rem] sm:px-10 sm:py-10">
        <div className="mb-9 space-y-2 text-center sm:mb-10">
          <h1 className="text-[1.65rem] font-bold leading-snug tracking-tight text-[#172339] sm:text-[1.85rem]">
            {tf('title')}
          </h1>
          <p className="mx-auto max-w-sm text-[0.9375rem] leading-relaxed text-brand-auth-muted">
            {confirmedEmail ? tf('bodyStep2') : tf('body')}
          </p>
        </div>

        {!confirmedEmail ? (
          <div className="space-y-7">
            {emailState?.ok === false && emailState.code === 'emailNotFound' ? (
              <p className="rounded-2xl border border-destructive/35 bg-destructive/6 px-3.5 py-2.5 text-sm leading-snug text-destructive">
                {tf('errors.emailNotFound')}
              </p>
            ) : null}
            {emailState?.ok === false && emailState.code === 'generic' ? (
              <p className="rounded-2xl border border-destructive/35 bg-destructive/6 px-3.5 py-2.5 text-sm leading-snug text-destructive">
                {t('errors.generic')}
              </p>
            ) : null}

            <form action={emailFormAction} className="space-y-5">
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
                    aria-describedby={
                      emailState?.ok === false && emailState.fieldErrors?.email
                        ? 'email-error'
                        : undefined
                    }
                    aria-invalid={
                      emailState?.ok === false && emailState.fieldErrors?.email
                        ? true
                        : undefined
                    }
                    autoComplete="email"
                    className="h-12 rounded-xl border-0 bg-brand-auth-soft/90 pl-[2.625rem] pr-4 shadow-none ring-0 placeholder:text-brand-auth-muted/80 focus-visible:ring-[3px] focus-visible:ring-brand-auth/18 sm:h-[3.125rem]"
                    id="email"
                    name="email"
                    placeholder={t('emailPlaceholder')}
                    required
                    type="email"
                  />
                </div>
                {emailState?.ok === false && emailState.fieldErrors?.email ? (
                  <p className="text-xs leading-snug text-destructive" id="email-error">
                    {t('validation.emailInvalid')}
                  </p>
                ) : null}
              </div>

              <Button
                className="h-[3rem] w-full rounded-xl bg-brand-auth text-base font-semibold text-brand-auth-foreground shadow-[0_16px_40px_-24px_rgb(37_112_216_/_90%)] transition-[filter] hover:bg-brand-auth hover:brightness-[1.04] disabled:brightness-95 sm:h-[3.25rem] sm:rounded-[0.9375rem]"
                disabled={emailPending}
                type="submit"
              >
                {tf('continue')}
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-7">
            <form action={resetFormAction} className="space-y-5">
              <input name="email" type="hidden" value={confirmedEmail} />

              <div className="space-y-2">
                <Label
                  className="text-[0.9375rem] font-medium text-[#2c3f5c]"
                  htmlFor="password"
                >
                  {tf('newPassword')}
                </Label>
                <div className="relative flex items-center">
                  <Lock
                    aria-hidden
                    className="pointer-events-none absolute left-4 size-[1.1rem] text-brand-auth-muted"
                    strokeWidth={2}
                  />
                  <Input
                    aria-describedby={
                      resetState?.ok === false && resetState.fieldErrors?.password
                        ? 'password-error'
                        : undefined
                    }
                    aria-invalid={
                      resetState?.ok === false && resetState.fieldErrors?.password
                        ? true
                        : undefined
                    }
                    autoComplete="new-password"
                    className="h-12 rounded-xl border-0 bg-brand-auth-soft/90 pl-[2.625rem] pr-12 shadow-none ring-0 placeholder:text-brand-auth-muted focus-visible:ring-[3px] focus-visible:ring-brand-auth/18 sm:h-[3.125rem]"
                    id="password"
                    name="password"
                    placeholder={t('passwordPlaceholder')}
                    required
                    type={passwordVisible ? 'text' : 'password'}
                  />
                  <button
                    aria-label={passwordVisible ? t('hidePassword') : t('showPassword')}
                    aria-pressed={passwordVisible}
                    className="absolute right-3 flex size-8 items-center justify-center rounded-lg text-brand-auth-muted transition-colors hover:bg-black/[0.04] hover:text-brand-auth-soft-foreground active:bg-black/[0.07]"
                    onClick={() => setPasswordVisible((v) => !v)}
                    type="button"
                  >
                    {passwordVisible ? (
                      <EyeOff className="size-[1.1rem]" strokeWidth={2} />
                    ) : (
                      <Eye className="size-[1.1rem]" strokeWidth={2} />
                    )}
                  </button>
                </div>
                {resetState?.ok === false && resetState.fieldErrors?.password ? (
                  <p className="text-xs leading-snug text-destructive" id="password-error">
                    {tf('errors.passwordTooShort')}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label
                  className="text-[0.9375rem] font-medium text-[#2c3f5c]"
                  htmlFor="confirmPassword"
                >
                  {tf('confirmPassword')}
                </Label>
                <div className="relative flex items-center">
                  <Lock
                    aria-hidden
                    className="pointer-events-none absolute left-4 size-[1.1rem] text-brand-auth-muted"
                    strokeWidth={2}
                  />
                  <Input
                    aria-describedby={
                      resetState?.ok === false && resetState.fieldErrors?.confirmPassword
                        ? 'confirm-error'
                        : undefined
                    }
                    aria-invalid={
                      resetState?.ok === false && resetState.fieldErrors?.confirmPassword
                        ? true
                        : undefined
                    }
                    autoComplete="new-password"
                    className="h-12 rounded-xl border-0 bg-brand-auth-soft/90 pl-[2.625rem] pr-4 shadow-none ring-0 placeholder:text-brand-auth-muted focus-visible:ring-[3px] focus-visible:ring-brand-auth/18 sm:h-[3.125rem]"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder={t('passwordPlaceholder')}
                    required
                    type="password"
                  />
                </div>
                {resetState?.ok === false && resetState.fieldErrors?.confirmPassword ? (
                  <p className="text-xs leading-snug text-destructive" id="confirm-error">
                    {tf('errors.passwordMismatch')}
                  </p>
                ) : null}
              </div>

              <Button
                className="h-[3rem] w-full rounded-xl bg-brand-auth text-base font-semibold text-brand-auth-foreground shadow-[0_16px_40px_-24px_rgb(37_112_216_/_90%)] transition-[filter] hover:bg-brand-auth hover:brightness-[1.04] disabled:brightness-95 sm:h-[3.25rem] sm:rounded-[0.9375rem]"
                disabled={resetPending || resetState?.ok === true}
                type="submit"
              >
                {tf('submit')}
              </Button>
            </form>
          </div>
        )}
      </div>

      <footer className="mt-auto flex justify-center pt-14 text-[0.9375rem] text-brand-auth-muted">
        <p>
          <Link className="font-semibold text-brand-auth hover:underline" href="/auth/login">
            {t('backToSignIn')}
          </Link>
        </p>
      </footer>
    </div>
  )
}
