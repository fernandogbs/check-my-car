import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

type ForgotPageProps = {
  params: Promise<{ locale: string }>
}

export default async function ForgotPasswordPage({ params }: ForgotPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const tf = await getTranslations('Auth.ForgotPage')
  const t = await getTranslations('Auth')

  return (
    <div className="relative min-h-full flex-1 px-6 py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-black/[0.06] bg-card p-10 shadow-xl">
        <h1 className="text-xl font-semibold">{tf('title')}</h1>
        <p className="mt-3 text-muted-foreground">{tf('body')}</p>
        <p className="mt-8">
          <Link className="font-semibold text-brand-auth hover:underline" href="/auth/login">
            {t('backToSignIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
