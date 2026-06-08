import { setRequestLocale } from 'next-intl/server'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'

type ForgotPageProps = {
  params: Promise<{ locale: string }>
}

export default async function ForgotPasswordPage({ params }: ForgotPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="relative min-h-full flex-1">
      <ResetPasswordForm locale={locale} />
    </div>
  )
}
