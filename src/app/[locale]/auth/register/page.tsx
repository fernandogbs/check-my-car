import { setRequestLocale } from 'next-intl/server'
import { RegisterForm } from '@/features/auth/components/register-form'

type RegisterPageProps = {
  params: Promise<{ locale: string }>
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="relative min-h-full flex-1 overflow-x-hidden bg-gradient-to-b from-[#e8f4fc] from-15% via-[#f6fbfe] via-55% to-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-20%] top-[-30%] h-[62%] rounded-[55%] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--brand-auth)_28%,transparent)_0%,transparent_72%)] opacity-95 sm:left-[-10%] sm:right-[-10%]"
      />
      <RegisterForm locale={locale} />
    </div>
  )
}
