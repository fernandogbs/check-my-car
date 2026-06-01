-- Seed de dados para desenvolvimento.
-- Senha de todos os usuários: senha123
-- Depende de pgcrypto para gerar os hashes bcrypt.
-- Seguro rodar múltiplas vezes (ON CONFLICT DO NOTHING).

create extension if not exists pgcrypto;

-- ============================================================
-- Usuários
-- ============================================================

insert into public.users (id, email, nome, senha, tipo_usuario, telefone) values
  (
    '00000000-0000-0000-0000-000000000001',
    'comprador1@dev.com',
    'Ana Souza',
    crypt('senha123', gen_salt('bf', 10)),
    'comprador',
    '11991110001'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'comprador2@dev.com',
    'Carlos Mendes',
    crypt('senha123', gen_salt('bf', 10)),
    'comprador',
    '11991110002'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'inspetor1@dev.com',
    'Rafael Lima',
    crypt('senha123', gen_salt('bf', 10)),
    'verificador',
    '11991110003'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'inspetor2@dev.com',
    'Fernanda Costa',
    crypt('senha123', gen_salt('bf', 10)),
    'verificador',
    '11991110004'
  )
on conflict (id) do nothing;

-- ============================================================
-- Solicitações de vistoria
-- ============================================================

-- 1. Pendente — criada por Ana, sem inspetor (visível no Explorar)
insert into public.inspection_requests (
  id, created_by, vehicle_plate, vehicle_year, vehicle_model,
  inspection_type, inspection_location, notes, status
) values (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'ABC-1234', '2019/2020', 'Toyota Corolla XEi',
  'cautelar', 'Concessionária AutoBrasil — Av. Paulista, 1000, SP',
  'Verificar se houve batida na traseira. Há uma amassado suspeito no para-choque.',
  'pending'
) on conflict (id) do nothing;

-- 2. Pendente — criada por Carlos, sem inspetor
insert into public.inspection_requests (
  id, created_by, vehicle_plate, vehicle_year, vehicle_model,
  inspection_type, inspection_location, notes, status
) values (
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  'XYZ-5678', '2021/2021', 'Honda HR-V EXL',
  'transferencia', 'Garagem do vendedor — Rua das Flores, 45, Campinas, SP',
  null,
  'pending'
) on conflict (id) do nothing;

-- 3. Aceita — criada por Ana, aceita por Rafael (em andamento)
insert into public.inspection_requests (
  id, created_by, vehicle_plate, vehicle_year, vehicle_model,
  inspection_type, inspection_location, notes,
  status, accepted_by, accepted_at
) values (
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'DEF-9012', '2018/2018', 'Volkswagen T-Cross Highline',
  'cautelar', 'Loja MultiCarros — Rua do Comércio, 200, SP',
  'Quero saber o estado do câmbio e dos freios.',
  'accepted',
  '00000000-0000-0000-0000-000000000003',
  now() - interval '2 hours'
) on conflict (id) do nothing;

-- 4. Concluída — criada por Carlos, aceita e finalizada por Fernanda
insert into public.inspection_requests (
  id, created_by, vehicle_plate, vehicle_year, vehicle_model,
  inspection_type, inspection_location, notes,
  status, accepted_by, accepted_at, report_submitted_at, result_summary
) values (
  '10000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000002',
  'GHI-3456', '2020/2021', 'Fiat Pulse Impetus Turbo',
  'cautelar', 'Via Rápida Veículos — Rodovia Anhanguera, km 12, SP',
  'Verificar pintura e lataria com cuidado.',
  'completed',
  '00000000-0000-0000-0000-000000000004',
  now() - interval '3 days',
  now() - interval '1 day',
  '{
    "estado_geral": "Veículo em bom estado geral. Lataria sem reparos aparentes. Pintura original em 95% do veículo.",
    "recomendacao": "aprovado",
    "comentarios": "Motor sem ruídos anormais. Suspensão dianteira com leve folga, recomendo troca dos amortecedores em breve. Documentação em ordem."
  }'::jsonb
) on conflict (id) do nothing;

-- 5. Rascunho — criada por Ana, ainda não publicada
insert into public.inspection_requests (
  id, created_by, vehicle_plate, vehicle_year, vehicle_model,
  inspection_type, inspection_location, notes, status
) values (
  '10000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'JKL-7890', '2022/2023', 'Jeep Compass Limited',
  'cautelar', 'Ainda a definir',
  null,
  'draft'
) on conflict (id) do nothing;
