-- Solicitações de vistoria / inspeção: fluxo criar → aceitar → status → laudo → resultado.
-- Migration idempotente: pode ser reaplicada com segurança.

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'inspection_type' and n.nspname = 'public'
  ) then
    create type public.inspection_type as enum ('cautelar', 'transferencia');
  end if;
end $$;

create table if not exists public.inspection_requests (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users (id) on delete cascade,
  vehicle_plate text not null,
  vehicle_year text not null,
  vehicle_model text not null,
  inspection_type public.inspection_type not null,
  inspection_location text not null,
  notes text,
  client_document_path text,
  status text not null default 'pending',
  accepted_by uuid references auth.users (id) on delete set null,
  accepted_at timestamptz,
  report_storage_path text,
  report_submitted_at timestamptz,
  result_summary jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inspection_requests_status_check check (
    status in (
      'draft',
      'pending',
      'accepted',
      'in_progress',
      'awaiting_report',
      'completed',
      'cancelled'
    )
  ),
  constraint inspection_requests_vehicle_plate_length
    check (char_length(vehicle_plate) between 1 and 32),
  constraint inspection_requests_vehicle_year_length
    check (char_length(vehicle_year) between 4 and 9),
  constraint inspection_requests_vehicle_model_length
    check (char_length(vehicle_model) between 1 and 120),
  constraint inspection_requests_inspection_location_length
    check (char_length(inspection_location) between 1 and 200),
  constraint inspection_requests_notes_length
    check (notes is null or char_length(notes) <= 4000)
);

create index if not exists inspection_requests_created_by_idx on public.inspection_requests (created_by);
create index if not exists inspection_requests_accepted_by_idx on public.inspection_requests (accepted_by);
create index if not exists inspection_requests_status_idx on public.inspection_requests (status);

create or replace function public.inspection_requests_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists inspection_requests_set_updated_at on public.inspection_requests;
create trigger inspection_requests_set_updated_at
before update on public.inspection_requests
for each row
execute function public.inspection_requests_touch_updated_at();

create or replace function public.inspection_requests_enforce_created_by_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.created_by is distinct from old.created_by then
    raise exception 'created_by cannot change';
  end if;
  return new;
end;
$$;

drop trigger if exists inspection_requests_immutable_created_by on public.inspection_requests;
create trigger inspection_requests_immutable_created_by
before update on public.inspection_requests
for each row
execute function public.inspection_requests_enforce_created_by_immutable();

alter table public.inspection_requests enable row level security;

revoke all on public.inspection_requests from public;
grant select, insert, update on public.inspection_requests to authenticated;

drop policy if exists inspection_requests_select on public.inspection_requests;
create policy inspection_requests_select on public.inspection_requests
for select
to authenticated
using (
  created_by = (select auth.uid())
  or accepted_by = (select auth.uid())
  or (status = 'pending' and accepted_by is null)
);

drop policy if exists inspection_requests_insert on public.inspection_requests;
create policy inspection_requests_insert on public.inspection_requests
for insert
to authenticated
with check (created_by = (select auth.uid()));

-- Policy unificada de UPDATE (criador antes do aceite OU profissional que aceitou).
-- Mantida única para evitar `multiple_permissive_policies` advisor.
drop policy if exists inspection_requests_creator_update on public.inspection_requests;
drop policy if exists inspection_requests_acceptor_update on public.inspection_requests;
drop policy if exists inspection_requests_update on public.inspection_requests;
create policy inspection_requests_update on public.inspection_requests
for update
to authenticated
using (
  (
    created_by = (select auth.uid())
    and accepted_by is null
    and status in ('draft', 'pending', 'cancelled')
  )
  or accepted_by = (select auth.uid())
)
with check (
  (
    created_by = (select auth.uid())
    and accepted_by is null
    and status in ('draft', 'pending', 'cancelled')
  )
  or accepted_by = (select auth.uid())
);

-- Aceite atômico (SECURITY DEFINER restrito a um UPDATE fixo; search_path fixo).
create or replace function public.accept_inspection_request(request_id uuid)
returns public.inspection_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.inspection_requests;
begin
  update public.inspection_requests
  set
    accepted_by = auth.uid(),
    accepted_at = now(),
    status = 'accepted',
    updated_at = now()
  where id = request_id
    and status = 'pending'
    and accepted_by is null
  returning * into r;

  if not found then
    raise exception 'inspection request is not pending or already assigned'
      using errcode = 'P0001';
  end if;

  return r;
end;
$$;

revoke all on function public.accept_inspection_request(uuid) from public;
revoke execute on function public.accept_inspection_request(uuid) from anon;
grant execute on function public.accept_inspection_request(uuid) to authenticated;

comment on table public.inspection_requests is 'Solicitações de vistoria com dados do veículo (placa/ano/modelo), tipo (cautelar|transferencia), local e anexo do solicitante; RLS + RPC accept_inspection_request.';

-- Bucket Storage privado para anexos do solicitante (PDF/JPG até 10MB).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'inspection-attachments',
  'inspection-attachments',
  false,
  10485760,
  array['application/pdf', 'image/jpeg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Policies Storage: usuário sobe/lista/atualiza/deleta só na sua "pasta" <auth.uid()>/...
drop policy if exists "inspection_attachments_insert" on storage.objects;
create policy "inspection_attachments_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'inspection-attachments'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "inspection_attachments_select" on storage.objects;
create policy "inspection_attachments_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'inspection-attachments'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "inspection_attachments_update" on storage.objects;
create policy "inspection_attachments_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'inspection-attachments'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'inspection-attachments'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "inspection_attachments_delete" on storage.objects;
create policy "inspection_attachments_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'inspection-attachments'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
