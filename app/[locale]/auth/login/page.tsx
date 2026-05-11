import { setRequestLocale } from 'next-intl/server'
import { LoginForm } from '@/domain/auth/presentation/login-form'

type LoginPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({
  params,
  searchParams,
}: LoginPageProps) {
  const { locale } = await params
  const { error } = await searchParams

  setRequestLocale(locale)

  let urlError: 'oauth' | 'callback' | undefined
  if (error === 'oauth') {
    urlError = 'oauth'
  }
  if (error === 'callback') {
    urlError = 'callback'
  }

  return (
    <div className="relative min-h-full flex-1 overflow-x-hidden bg-gradient-to-b from-[#e8f4fc] from-15% via-[#f6fbfe] via-55% to-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-20%] top-[-30%] h-[62%] rounded-[55%] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--brand-auth)_28%,transparent)_0%,transparent_72%)] opacity-95 sm:left-[-10%] sm:right-[-10%]"
      />
      <LoginForm locale={locale} urlError={urlError} />
    </div>
  )
}
