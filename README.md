# Check My Car

Aplicação web que conecta compradores de veículos a inspetores automotivos. Compradores submetem solicitações de vistoria para veículos usados; inspetores consultam as solicitações abertas, aceitam uma, realizam a vistoria presencial e enviam um laudo estruturado. O laudo fica disponível para o comprador baixar.

## Visão geral

**Perfis de usuário**

- **Comprador** — cria solicitações de vistoria (cautelar ou transferência), acompanha o status e baixa o laudo final.
- **Inspetor** — consulta solicitações pendentes, aceita uma, preenche o laudo com os resultados da vistoria e anexos, e finaliza o atendimento.

**Fluxo principal**

1. O comprador abre uma nova solicitação via formulário em etapas (dados do veículo, tipo e local da vistoria, observações e documento opcional).
2. Inspetores visualizam todas as solicitações pendentes em um feed de exploração e podem aceitar uma.
3. Após aceitar, o inspetor preenche o formulário de laudo.
4. O laudo concluído fica disponível para o comprador baixar em PDF.

## Stack tecnológico

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript |
| Banco de dados / Storage | Supabase (Postgres + Storage) |
| Autenticação | Cookie de sessão próprio (`cmc_session`, HMAC-SHA256) — sem Supabase Auth |
| UI | Tailwind CSS v4, shadcn/ui, Base UI |
| Estado | Zustand (store de formulários), TanStack Query (estado do servidor) |
| Validação | Zod |
| i18n | next-intl (português como padrão, inglês disponível) |
| Testes | Vitest + Testing Library |

## Como rodar

**Pré-requisitos:** Node.js 20+, [Bun](https://bun.sh), um projeto Supabase.

```bash
# Instalar dependências
bun install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY e AUTH_SECRET

# Aplicar as migrações do banco
bunx supabase db push

# Iniciar o servidor de desenvolvimento
bun dev
```

A aplicação roda em `http://localhost:3000`. O locale padrão é português (`/pt`); inglês disponível em `/en`.

## Estrutura do projeto

```
src/
  app/
    api/              # Route handlers (solicitações de vistoria, autenticação)
    [locale]/
      (app)/          # Páginas autenticadas (dashboard, explorar, solicitações, perfil)
      auth/           # Login, cadastro, recuperação de senha
  features/
    auth/             # Formulários de auth, server actions, utilitários de sessão
    inspection-requests/  # Formulários de solicitação, visão do inspetor, laudo
    profile/          # Configurações de perfil
  lib/
    supabase/         # Clientes Supabase (browser, server, admin)
    api/              # Helpers e schemas compartilhados de API
  shared/
    components/       # Layout (header, bottom nav) e componentes base de UI
  i18n/               # Configuração de rotas e locales do next-intl
```

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `bun dev` | Inicia o servidor de desenvolvimento |
| `bun build` | Build de produção |
| `bun start` | Inicia o servidor de produção |
| `bun lint` | Executa o ESLint |
| `bun test` | Executa os testes (Vitest) |
| `bun test:watch` | Executa os testes em modo watch |

## API

A API HTTP está documentada em [`supabase/API.md`](supabase/API.md). Todas as rotas utilizam o cookie de sessão próprio para autenticação; o cliente service-role do Supabase é usado no servidor, e a verificação de propriedade dos registros é feita em código, não via políticas RLS.
