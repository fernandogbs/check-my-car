import { getTranslations, setRequestLocale } from 'next-intl/server'

type ProfilePageProps = {
  params: Promise<{ locale: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Nav')

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-xl font-semibold tracking-tight text-[#172339]">
        {t('profile')}
      </h1>
    </div>
  )
}
