import { getTranslations, setRequestLocale } from 'next-intl/server'

type DashboardPageProps = {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Nav')

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-xl font-semibold tracking-tight text-[#172339]">
        {t('dashboard')}
      </h1>
    </div>
  )
}
