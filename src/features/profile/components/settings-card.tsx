'use client'

import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'

type SettingsCardProps = {
  currentLocale: string
}

export function SettingsCard({ currentLocale }: SettingsCardProps) {
  const t = useTranslations('Profile')
  const router = useRouter()
  const pathname = usePathname()

  function handleLanguageChange(locale: string) {
    if (locale === currentLocale) return

    const newPathname = pathname.replace(new RegExp(`^/${currentLocale}`), `/${locale}`)
    router.push(newPathname, { locale: locale as Locale })
  }

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-card p-6 shadow-sm">
      <div className="space-y-6">
        <div>
          <label
            htmlFor="language-select"
            className="text-xs font-medium uppercase tracking-wide text-brand-auth-muted"
          >
            {t('settings.language')}
          </label>
          <select
            id="language-select"
            value={currentLocale}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="mt-2 block w-full rounded-lg border border-black/[0.1] bg-white px-3 py-2 text-[0.9375rem] font-medium text-[#172339] transition-colors hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-brand-auth/30"
          >
            {routing.locales.map((locale) => (
              <option key={locale} value={locale}>
                {t(`settings.languages.${locale}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
