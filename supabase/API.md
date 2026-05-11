# API HTTP ↔ Supabase (`inspection_requests`)

Rotas Next.js em `app/api/**` usam o cliente SSR (`@/lib/supabase/server`) com cookies de sessão: o Postgres aplica **RLS**; não uses `service_role` nestas rotas.

Aplicar migração antes de testar:

```bash
bunx supabase db push   # remoto, com link
# ou stack local: bunx supabase migration up
```

Base URL (exemplo): `https://seu-dominio.com`.

### Formato de erros

Respostas de erro são JSON com o formato:

```json
{ "error": { "code": "string_curta", "message": "detalhe" } }
```

Códigos HTTP usados com frequência: `400` (validação / transição inválida), `401` (sem sessão), `403` (proibido pela rota), `404` (não encontrado ou RLS), `409` (conflito, p.ex. aceite duplicado), `500` (erro Supabase / Postgres).

---

## 1. Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/auth/me` | Devolve `id`, `email`, `app_metadata`, `created_at` do utilizador da sessão atual. |

**401** — sem sessão válida.

Fluxo de login continua nas páginas `/{locale}/auth/*` e no callback OAuth; esta rota serve para o cliente confirmar a sessão após cookies definidos.

---

## 2. Criação e listagem de solicitações

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/inspection/requests` | Lista linhas permitidas por RLS (próprias, aceites por ti, ou `pending` na fila). |
| `POST` | `/api/inspection/requests` | Cria registo em `public.inspection_requests`. |

**Corpo `POST` (JSON)**

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|--------|
| `vehicle_plate` | string | sim | até 32 chars |
| `vehicle_model` | string \| null | não | até 120 chars |
| `notes` | string \| null | não | até 4000 chars |
| `status` | `"draft"` \| `"pending"` | não | omissão: `pending` |

`created_by` é sempre o `auth.uid()` da sessão (validado por RLS).

**201** — `{ "data": { ...row } }`.

---

## 3. Detalhe de uma solicitação

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/inspection/requests/{requestId}` | Detalhe completo (UUID). |

**404** — id inexistente ou sem permissão de leitura (RLS).

---

## 4. Aceite de demanda

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/inspection/requests/{requestId}/accept` | Chama a RPC `accept_inspection_request`: só para filas `pending` sem `accepted_by`. |

**409 / 400** — não pendente ou já atribuída (mensagem da RPC).

**200** — `{ "data": { ...row atualizado } }`.

---

## 5. Atualização de status (e resumo do resultado)

| Método | Rota | Descrição |
|--------|------|-----------|
| `PATCH` | `/api/inspection/requests/{requestId}/status` | Atualiza `status` e opcionalmente `result_summary`. |

**Corpo (JSON)**

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `status` | ver enum na migração | sim |
| `result_summary` | JSON arbitrário \| null | não |

Regras de aplicação:

- Criador: apenas `draft`, `pending`, `cancelled` enquanto não houver aceite (RLS).
- Profissional aceite: alterações permitidas pelas políticas de `accepted_by`.
- `completed`: exige laudo (`report_storage_path`) e aceite prévio (validação na rota).

Estados possíveis: `draft`, `pending`, `accepted`, `in_progress`, `awaiting_report`, `completed`, `cancelled`.

---

## 6. Envio de laudo (metadados)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/inspection/requests/{requestId}/report` | Grava `report_storage_path` e `report_submitted_at`; pode avançar `status` para `awaiting_report`. |

**Corpo (JSON)**

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `report_storage_path` | string | sim (caminho no bucket Storage após upload) |

Apenas o profissional com `accepted_by = auth.uid()` pode submeter (403 caso contrário).

Upload do ficheiro: usa o fluxo normal do Supabase Storage (URL assinada ou cliente) **antes** de chamar esta rota; aqui só persistimos o caminho.

---

## 7. Visualização do resultado

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/inspection/requests/{requestId}/result` | Campos resumidos: `id`, `status`, `vehicle_plate`, `vehicle_model`, `result_summary`, `report_storage_path`, `report_submitted_at`, `updated_at`. |

Mesmas regras de leitura que o `GET` detalhe (RLS).

---

## Tabela `public.inspection_requests`

Definida em `supabase/migrations/20260511192208_inspection_requests.sql`, com RLS e função `public.accept_inspection_request(uuid)`.

---

## Casos de teste com `curl`

### Pré-requisitos

1. Migração aplicada e app a correr (`bun run dev`, por defeito `http://localhost:3000`).
2. Dois utilizadores autenticados no Supabase Auth (ex.: **Cliente** e **Profissional**), cada um com sessão no browser após login.
3. Copiar o header `Cookie` da aba **Network** (qualquer pedido autenticado ao teu domínio) ou os cookies `sb-*` em **Application → Cookies**.

Define variáveis (ajusta os valores):

```bash
export BASE_URL="http://localhost:3000"
# Cookie completo tal como no browser (pode incluir vários sb-*)
export COOKIE_CLIENTE='sb-...=...; sb-...=...'
export COOKIE_PROFISSIONAL='sb-...=...; sb-...=...'
# Opcional: jq para extrair UUID da resposta de criação (brew install jq / pacman -S jq)
```

Para ver o código HTTP no final de cada pedido, acrescenta `-w "\n%{http_code}\n"` aos exemplos abaixo.

### Matriz de casos

| # | Caso | Utilizador | Método e rota | HTTP esperado |
|---|------|------------|---------------|---------------|
| T1 | Sessão válida | qualquer logado | `GET /api/auth/me` | `200` |
| T2 | Sem cookies | — | `GET /api/auth/me` | `401` |
| T3 | Criar solicitação | Cliente | `POST /api/inspection/requests` | `201` |
| T4 | Corpo inválido (matrícula vazia) | Cliente | `POST /api/inspection/requests` | `400` |
| T5 | Listar visíveis por RLS | Cliente ou Profissional | `GET /api/inspection/requests` | `200` |
| T6 | Detalhe por UUID | quem tem leitura | `GET /api/inspection/requests/{id}` | `200` |
| T7 | UUID inválido no path | logado | `GET /api/inspection/requests/not-a-uuid` | `400` |
| T8 | Aceitar demanda pendente | Profissional (ou criador) | `POST .../{id}/accept` | `200` |
| T9 | Segundo aceite após já atribuído | qualquer sessão | `POST .../{id}/accept` | `409` se `error.code` for `P0001`; caso contrário `400` |
| T10 | Aceitar o próprio pedido (criador = aceitador) | Cliente (dono) | `POST .../{id}/accept` | `200` se ainda `pending` (comportamento actual da RPC) |
| T11 | Atualizar status (profissional) | Profissional aceite | `PATCH .../{id}/status` | `200` |
| T12 | `completed` sem laudo | Profissional aceite | `PATCH .../{id}/status` com `completed` | `400` |
| T13 | Enviar metadados do laudo | Profissional aceite | `POST .../{id}/report` | `200` |
| T14 | Laudo por quem não aceitou | Cliente (dono) | `POST .../{id}/report` | `403` |
| T15 | Laudo antes de aceite | Profissional (outro pedido ainda `pending` sem ele) | `POST .../{id}/report` | `400` |
| T16 | Ver resultado resumido | Cliente ou Profissional com leitura | `GET .../{id}/result` | `200` |

Notas:

- **T9**: executa **duas vezes** o `POST .../accept` com o mesmo `REQUEST_ID` após um aceite bem-sucedido; o segundo falha.
- **T12**: num pedido aceite **sem** `report_storage_path`; depois de **T13**, o mesmo `PATCH` com `completed` deve devolver `200`.

---

### T1 — `GET /api/auth/me` (sucesso)

```bash
curl -sS "$BASE_URL/api/auth/me" \
  -H "Cookie: $COOKIE_CLIENTE" \
  -H "Accept: application/json" \
  -w "\nHTTP %{http_code}\n"
```

Resposta esperada (`200`): JSON com `id`, `email`, `app_metadata`, `created_at`.

### T2 — Sem sessão (`401`)

```bash
curl -sS "$BASE_URL/api/auth/me" \
  -H "Accept: application/json" \
  -w "\nHTTP %{http_code}\n"
```

Resposta esperada: `{"error":{"code":"unauthorized",...}}` e HTTP `401`.

### T3 — Criar solicitação (`201`)

```bash
curl -sS -X POST "$BASE_URL/api/inspection/requests" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE_CLIENTE" \
  -H "Accept: application/json" \
  -d '{"vehicle_plate":"AA-00-BB","vehicle_model":"Example","notes":"Teste curl","status":"pending"}' \
  -w "\nHTTP %{http_code}\n"
```

Guardar o `id` devolvido em `data.id`:

```bash
REQUEST_ID="$(
  curl -sS -X POST "$BASE_URL/api/inspection/requests" \
    -H "Content-Type: application/json" \
    -H "Cookie: $COOKIE_CLIENTE" \
    -d '{"vehicle_plate":"BB-11-CC","status":"pending"}' \
  | jq -r '.data.id'
)"
echo "$REQUEST_ID"
```

### T4 — Validação Zod (`400`)

```bash
curl -sS -X POST "$BASE_URL/api/inspection/requests" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE_CLIENTE" \
  -d '{"vehicle_plate":"","status":"pending"}' \
  -w "\nHTTP %{http_code}\n"
```

Esperado: `400`, `code` típico `validation_error`.

### T5 — Listar solicitações (`200`)

```bash
curl -sS "$BASE_URL/api/inspection/requests" \
  -H "Cookie: $COOKIE_PROFISSIONAL" \
  -H "Accept: application/json" \
  -w "\nHTTP %{http_code}\n"
```

### T6 — Detalhe (`200`)

Substitui `$REQUEST_ID` pelo UUID real.

```bash
curl -sS "$BASE_URL/api/inspection/requests/$REQUEST_ID" \
  -H "Cookie: $COOKIE_CLIENTE" \
  -H "Accept: application/json" \
  -w "\nHTTP %{http_code}\n"
```

### T7 — UUID inválido (`400`)

```bash
curl -sS "$BASE_URL/api/inspection/requests/nao-e-uuid" \
  -H "Cookie: $COOKIE_CLIENTE" \
  -w "\nHTTP %{http_code}\n"
```

### T8 — Aceitar demanda (`200`)

Usa cookie do **profissional** (não o do criador, se quiseres simular fila real).

```bash
curl -sS -X POST "$BASE_URL/api/inspection/requests/$REQUEST_ID/accept" \
  -H "Cookie: $COOKIE_PROFISSIONAL" \
  -H "Accept: application/json" \
  -w "\nHTTP %{http_code}\n"
```

### T9 — Aceite duplicado (`409` ou `400`)

Repete o mesmo `POST` **accept** com o mesmo ou outro utilizador:

```bash
curl -sS -X POST "$BASE_URL/api/inspection/requests/$REQUEST_ID/accept" \
  -H "Cookie: $COOKIE_PROFISSIONAL" \
  -H "Accept: application/json" \
  -w "\nHTTP %{http_code}\n"
```

### T11 — Atualizar status (`200`)

```bash
curl -sS -X PATCH "$BASE_URL/api/inspection/requests/$REQUEST_ID/status" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE_PROFISSIONAL" \
  -d '{"status":"in_progress"}' \
  -w "\nHTTP %{http_code}\n"
```

Com resumo JSON opcional:

```bash
curl -sS -X PATCH "$BASE_URL/api/inspection/requests/$REQUEST_ID/status" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE_PROFISSIONAL" \
  -d '{"status":"awaiting_report","result_summary":{"nota":"aprovado"}}' \
  -w "\nHTTP %{http_code}\n"
```

### T12 — `completed` sem laudo (`400`)

Num pedido **aceite** mas **sem** `report_storage_path`:

```bash
curl -sS -X PATCH "$BASE_URL/api/inspection/requests/$REQUEST_ID/status" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE_PROFISSIONAL" \
  -d '{"status":"completed"}' \
  -w "\nHTTP %{http_code}\n"
```

Esperado: `400`, `code` `invalid_transition`.

### T13 — Metadados do laudo (`200`)

```bash
curl -sS -X POST "$BASE_URL/api/inspection/requests/$REQUEST_ID/report" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE_PROFISSIONAL" \
  -d "{\"report_storage_path\":\"inspection-reports/$REQUEST_ID/laudo.pdf\"}" \
  -w "\nHTTP %{http_code}\n"
```

### T14 — Laudo pelo cliente (`403`)

```bash
curl -sS -X POST "$BASE_URL/api/inspection/requests/$REQUEST_ID/report" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE_CLIENTE" \
  -d "{\"report_storage_path\":\"inspection-reports/$REQUEST_ID/outro.pdf\"}" \
  -w "\nHTTP %{http_code}\n"
```

### T16 — Resultado resumido (`200`)

```bash
curl -sS "$BASE_URL/api/inspection/requests/$REQUEST_ID/result" \
  -H "Cookie: $COOKIE_CLIENTE" \
  -H "Accept: application/json" \
  -w "\nHTTP %{http_code}\n"
```

### Fluxo mínimo E2E (script único)

Ordem sugerida para um único `REQUEST_ID` novo: **T3** → **T8** → **T11** (`in_progress`) → **T13** → **T11** ou **PATCH** com `completed` (após T13, **T12** deve passar a **200**):

```bash
curl -sS -X PATCH "$BASE_URL/api/inspection/requests/$REQUEST_ID/status" \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE_PROFISSIONAL" \
  -d '{"status":"completed","result_summary":{"resultado":"ok"}}' \
  -w "\nHTTP %{http_code}\n"
```

---

## Segurança (Supabase)

- Não uses `user_metadata` em políticas; papéis vão em `app_metadata` se precisares de perfis.
- A RPC `accept_inspection_request` é `SECURITY DEFINER` com `search_path` fixo apenas para o UPDATE controlado — revê se alterares a função.
- Garante **RLS** + **GRANT** coerentes ao expor tabelas na Data API.
