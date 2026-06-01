-- Migration: custom auth via public.users + repoint inspection_requests FKs.
-- Idempotente: pode ser reaplicada com segurança.
--
-- NOTA IMPORTANTE:
--   Linhas existentes em inspection_requests que referenciam IDs de auth.users
--   (e não de public.users) violarão as novas FKs. Em desenvolvimento, truncar
--   inspection_requests antes de aplicar se necessário:
--     truncate table public.inspection_requests cascade;
--
--   O RLS em inspection_requests permanece ativo, mas é ignorado pelo cliente
--   service-role (SUPABASE_SECRET_KEY). A validação de dono é feita em código
--   nas route handlers do Next.js — não via políticas RLS.

-- ============================================================
-- 1. public.users — defaults e índice único case-insensitive
-- ============================================================

do $$
begin
  -- Garantir default gen_random_uuid() em id
  begin
    alter table public.users alter column id set default gen_random_uuid();
  exception when others then
    null; -- já existe
  end;

  -- Garantir default now() em created_at
  begin
    alter table public.users alter column created_at set default now();
  exception when others then
    null; -- já existe
  end;
end $$;

-- Índice único em email case-insensitive (substitui eventual unique constraint simples)
create unique index if not exists users_email_lower_key
  on public.users (lower(email));

-- ============================================================
-- 2. Bloquear acesso da chave pública a public.users
--    (auth ocorre apenas via service-role no servidor)
-- ============================================================

alter table public.users enable row level security;

-- Revogar todos os privilégios das roles públicas; a chave anon/authenticated
-- não pode ler hashes de senha nem quaisquer dados de utilizadores.
revoke all on public.users from anon, authenticated;

-- ============================================================
-- 3. Repontar FKs de inspection_requests: auth.users → public.users
-- ============================================================

-- created_by: cascade delete (quando user é removido, as suas solicitações também)
alter table public.inspection_requests
  drop constraint if exists inspection_requests_created_by_fkey;

alter table public.inspection_requests
  add constraint inspection_requests_created_by_fkey
  foreign key (created_by)
  references public.users (id)
  on delete cascade;

-- accepted_by: set null (quando profissional é removido, a solicitação fica sem aceitante)
alter table public.inspection_requests
  drop constraint if exists inspection_requests_accepted_by_fkey;

alter table public.inspection_requests
  add constraint inspection_requests_accepted_by_fkey
  foreign key (accepted_by)
  references public.users (id)
  on delete set null;
