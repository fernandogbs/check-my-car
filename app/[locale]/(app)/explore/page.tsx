import { getTranslations, setRequestLocale } from 'next-intl/server'

type ExplorePageProps = {
  params: Promise<{ locale: string }>
}

export default async function ExplorePage({ params }: ExplorePageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Nav')

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-xl font-semibold tracking-tight text-[#172339]">
        {t('explore')}
      </h1>
    </div>
  )
}
