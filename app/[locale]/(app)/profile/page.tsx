import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth/current-user'
import { signOut } from '@/domain/auth/application/sign-out-action'

type ProfilePageProps = {
  params: Promise<{ locale: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Nav')
  const tAuth = await getTranslations('Auth')

  const user = await getCurrentUser()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight text-[#172339]">
        {t('profile')}
      </h1>

      <div className="rounded-2xl border border-black/[0.06] bg-card p-6 shadow-sm">
        <dl className="space-y-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-brand-auth-muted">
              {tAuth('RegisterForm.name')}
            </dt>
            <dd className="mt-0.5 text-[0.9375rem] font-medium text-[#172339]">
              {user?.nome ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-brand-auth-muted">
              {tAuth('email')}
            </dt>
            <dd className="mt-0.5 text-[0.9375rem] font-medium text-[#172339]">
              {user?.email ?? '—'}
            </dd>
          </div>
          {user?.telefone ? (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-brand-auth-muted">
                {tAuth('RegisterForm.phone')}
              </dt>
              <dd className="mt-0.5 text-[0.9375rem] font-medium text-[#172339]">
                {user.telefone}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-brand-auth-muted">
              {tAuth('accountType')}
            </dt>
            <dd className="mt-0.5 text-[0.9375rem] font-medium text-[#172339]">
              {user?.tipo_usuario === 'verificador'
                ? tAuth('roleInspector')
                : tAuth('roleBuyer')}
            </dd>
          </div>
        </dl>
      </div>

      <form action={signOut}>
        <input type="hidden" name="locale" value={locale} />
        <Button type="submit" variant="outline">
          {tAuth('signOut')}
        </Button>
      </form>
    </div>
  )
}
