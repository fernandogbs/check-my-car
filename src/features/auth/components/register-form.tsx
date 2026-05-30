'use client'

import { useActionState, useState } from 'react'
import {
  Car,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  UserCog,
  UserRound,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/lib/utils'
import { signUp } from '../services/actions/sign-up-action'
import {
  type RegisterActionState,
  initialRegisterActionState,
} from '../types/register-action-state'

type TipoUsuario = 'comprador' | 'verificador'

type RegisterFormProps = {
  locale: string
}

export function RegisterForm({ locale }: RegisterFormProps) {
  const t = useTranslations('Auth')
  const tr = useTranslations('Auth.RegisterForm')
  const [role, setRole] = useState<TipoUsuario>('comprador')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [state, formAction, pending] = useActionState<RegisterActionState, FormData>(
    signUp,
    initialRegisterActionState,
  )

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
            {tr('title')}
          </h1>
          <p className="mx-auto max-w-sm text-[0.9375rem] leading-relaxed text-brand-auth-muted">
            {tr('description')}
          </p>
        </div>

        <div className="space-y-7">
          {state?.ok === false && state.code === 'emailTaken' ? (
            <p className="rounded-2xl border border-destructive/35 bg-destructive/6 px-3.5 py-2.5 text-sm leading-snug text-destructive">
              {tr('errors.emailTaken')}
            </p>
          ) : null}
          {state?.ok === false && state.code === 'generic' ? (
            <p className="rounded-2xl border border-destructive/35 bg-destructive/6 px-3.5 py-2.5 text-sm leading-snug text-destructive">
              {tr('errors.generic')}
            </p>
          ) : null}

          <fieldset className="m-0 min-w-0 space-y-2.5 border-0 p-0">
            <legend className="text-[0.9375rem] font-medium text-[#2c3f5c]">
              {t('roleLabel')}
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { id: 'comprador' as const, label: 'roleBuyer', Icon: UserRound },
                  { id: 'verificador' as const, label: 'roleInspector', Icon: UserCog },
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

          <form action={formAction} className="space-y-5">
            <input name="locale" type="hidden" value={locale} />
            <input name="tipo_usuario" type="hidden" value={role} />

            {/* Nome */}
            <div className="space-y-2">
              <Label
                className="text-[0.9375rem] font-medium text-[#2c3f5c]"
                htmlFor="nome"
              >
                {tr('name')}
              </Label>
              <div className="relative flex items-center">
                <UserRound
                  aria-hidden
                  className="pointer-events-none absolute left-4 size-[1.1rem] text-brand-auth-muted"
                  strokeWidth={2}
                />
                <Input
                  aria-invalid={state?.fieldErrors?.nome ? true : undefined}
                  aria-describedby={state?.fieldErrors?.nome ? 'nome-error' : undefined}
                  autoComplete="name"
                  className="h-12 rounded-xl border-0 bg-brand-auth-soft/90 pl-[2.625rem] pr-4 shadow-none ring-0 placeholder:text-brand-auth-muted/80 focus-visible:ring-[3px] focus-visible:ring-brand-auth/18 sm:h-[3.125rem]"
                  id="nome"
                  name="nome"
                  placeholder={tr('namePlaceholder')}
                  required
                  type="text"
                />
              </div>
              {state?.fieldErrors?.nome ? (
                <p className="text-xs leading-snug text-destructive" id="nome-error">
                  {tr('validation.nameRequired')}
                </p>
              ) : null}
            </div>

            {/* Email */}
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
                  {tr('validation.emailInvalid')}
                </p>
              ) : null}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label
                className="text-[0.9375rem] font-medium text-[#2c3f5c]"
                htmlFor="telefone"
              >
                {tr('phone')}
              </Label>
              <div className="relative flex items-center">
                <Phone
                  aria-hidden
                  className="pointer-events-none absolute left-4 size-[1.1rem] text-brand-auth-muted"
                  strokeWidth={2}
                />
                <Input
                  aria-invalid={state?.fieldErrors?.telefone ? true : undefined}
                  aria-describedby={state?.fieldErrors?.telefone ? 'telefone-error' : undefined}
                  autoComplete="tel"
                  className="h-12 rounded-xl border-0 bg-brand-auth-soft/90 pl-[2.625rem] pr-4 shadow-none ring-0 placeholder:text-brand-auth-muted/80 focus-visible:ring-[3px] focus-visible:ring-brand-auth/18 sm:h-[3.125rem]"
                  id="telefone"
                  name="telefone"
                  placeholder={tr('phonePlaceholder')}
                  type="tel"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label
                className="text-[0.9375rem] font-medium text-[#2c3f5c]"
                htmlFor="senha"
              >
                {t('password')}
              </Label>
              <div className="relative flex items-center">
                <Lock
                  aria-hidden
                  className="pointer-events-none absolute left-4 size-[1.1rem] text-brand-auth-muted"
                  strokeWidth={2}
                />
                <Input
                  aria-invalid={state?.fieldErrors?.senha ? true : undefined}
                  aria-describedby={state?.fieldErrors?.senha ? 'senha-error' : undefined}
                  autoComplete="new-password"
                  className="h-12 rounded-xl border-0 bg-brand-auth-soft/90 pl-[2.625rem] pr-12 shadow-none ring-0 placeholder:text-brand-auth-muted focus-visible:ring-[3px] focus-visible:ring-brand-auth/18 sm:h-[3.125rem]"
                  id="senha"
                  minLength={8}
                  name="senha"
                  placeholder={t('passwordPlaceholder')}
                  required
                  type={passwordVisible ? 'text' : 'password'}
                />
                <button
                  aria-label={passwordVisible ? t('hidePassword') : t('showPassword')}
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
              {state?.fieldErrors?.senha ? (
                <p className="text-xs leading-snug text-destructive" id="senha-error">
                  {tr('validation.passwordTooShort')}
                </p>
              ) : null}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label
                className="text-[0.9375rem] font-medium text-[#2c3f5c]"
                htmlFor="confirmarSenha"
              >
                {tr('confirmPassword')}
              </Label>
              <div className="relative flex items-center">
                <Lock
                  aria-hidden
                  className="pointer-events-none absolute left-4 size-[1.1rem] text-brand-auth-muted"
                  strokeWidth={2}
                />
                <Input
                  aria-invalid={state?.fieldErrors?.confirmarSenha ? true : undefined}
                  aria-describedby={
                    state?.fieldErrors?.confirmarSenha ? 'confirmarSenha-error' : undefined
                  }
                  autoComplete="new-password"
                  className="h-12 rounded-xl border-0 bg-brand-auth-soft/90 pl-[2.625rem] pr-12 shadow-none ring-0 placeholder:text-brand-auth-muted focus-visible:ring-[3px] focus-visible:ring-brand-auth/18 sm:h-[3.125rem]"
                  id="confirmarSenha"
                  name="confirmarSenha"
                  placeholder={tr('confirmPasswordPlaceholder')}
                  required
                  type={confirmVisible ? 'text' : 'password'}
                />
                <button
                  aria-label={confirmVisible ? t('hidePassword') : t('showPassword')}
                  aria-pressed={confirmVisible}
                  className="absolute right-3 flex size-8 items-center justify-center rounded-lg text-brand-auth-muted transition-colors hover:bg-black/[0.04] hover:text-brand-auth-soft-foreground active:bg-black/[0.07]"
                  onClick={() => {
                    setConfirmVisible((v) => !v)
                  }}
                  type="button"
                >
                  {confirmVisible ? (
                    <EyeOff className="size-[1.1rem]" strokeWidth={2} />
                  ) : (
                    <Eye className="size-[1.1rem]" strokeWidth={2} />
                  )}
                </button>
              </div>
              {state?.fieldErrors?.confirmarSenha ? (
                <p
                  className="text-xs leading-snug text-destructive"
                  id="confirmarSenha-error"
                >
                  {tr('validation.passwordsMismatch')}
                </p>
              ) : null}
            </div>

            <Button
              className="h-[3rem] w-full rounded-xl bg-brand-auth text-base font-semibold text-brand-auth-foreground shadow-[0_16px_40px_-24px_rgb(37_112_216_/_90%)] transition-[filter] hover:bg-brand-auth hover:brightness-[1.04] disabled:brightness-95 sm:h-[3.25rem] sm:rounded-[0.9375rem]"
              disabled={pending}
              type="submit"
            >
              {pending ? tr('creating') : tr('signUp')}
            </Button>
          </form>
        </div>
      </div>

      <footer className="mt-auto flex justify-center pt-14 text-[0.9375rem] text-brand-auth-muted">
        <p>
          <span>{tr('haveAccountPrompt')} </span>
          <Link
            className="font-semibold text-brand-auth hover:underline"
            href="/auth/login"
          >
            {tr('signInLink')}
          </Link>
        </p>
      </footer>
    </div>
  )
}
