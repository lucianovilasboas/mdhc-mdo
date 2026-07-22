# AGENTS.md — ODK Dashboard

## Projeto

Dashboard unificado do **Projeto Envelhecer nos Territórios** — MDHC.
Acompanhamento visual de agentes de campo, idosos cadastrados e indicadores
sociodemográficos e de direitos, consolidando múltiplos projetos do ODK Central.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14+ (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS + shadcn/ui |
| Gráficos | Recharts |
| Mapa | Leaflet (react-leaflet) |
| Autenticação | NextAuth.js (credentials) |
| Deploy | Docker Compose |

## Backend de Dados

ODK Central em `https://mdocentral.ifrj.edu.br`.
Acessado via API Routes do Next.js (proxy server-side).

Credenciais em `.env.local`:
```
ODK_BASE_URL=https://mdocentral.ifrj.edu.br
ODK_USERNAME=luciano.espiridiao@ifmg.edu.br
ODK_PASSWORD=...
NEXTAUTH_SECRET=...
```

## Projetos na Produção

| ID | Instituição | Cidades | Status |
|---|---|---|---|
| 12 | ANADIPS | Macapá (AP) | implantação |
| 4 | FIOCRUZ | Cáceres, Barra do Garças (MT) + Fercal, Itapoã, Paranoá, Estrutural (DF) | implantação |
| 3 | IFMG - Bom Despacho | Pompéu, Pitangui, Perdigão, Martinho Campos, Igaratinga, São Gonçalo do Pará (MG) | implantação |
| 2 | IFMG - João Monlevade | João Monlevade, Nova Era, Santa Bárbara, Rio Piracicaba (MG) | implantação |
| **5** | **IFMS** | **Corumbá, Bela Vista, Ivinhema, Fátima do Sul (MS)** | **ativo** |
| 10 | IFSP - Guarulhos | Guarulhos (SP) | implantação |
| 9 | IFSP - Jundiaí | Jundiaí (SP) | implantação |
| 11 | IFSP - Presidente Prudente | Alvares Machado, Regente Feijó, Pres. Epitácio, Pirapozinho (SP) | implantação |
| 7 | UFGD | Dourados (MS) | implantação |
| **6** | **UFMS** | **Aquidauana, Coxim, Naviraí, Ponta Porã (MS)** | **ativo** |
| 8 | UFPE | Vitória de Santo Antônio (PE) | implantação |

## Formulários

Padronizados entre todos os projetos:
- `form_parte_1` — Cadastro Inicial (sociodemográfico, renda, moradia, apoio social, saúde)
- `form_parte_2` — Avaliação de Direitos (discriminação, violência, acesso a serviços)

## Rotas

| Rota | Descrição |
|---|---|
| `/login` | Autenticação via NextAuth |
| `/dashboard` | Dashboard principal (visão executiva) |
| `/dashboard/projeto/[id]` | Detalhamento por projeto |
| `/dashboard/municipio/[slug]` | Detalhamento por município |

## API Routes (proxy ODK)

```
GET /api/odk/[projectId]/submissions?form=parte_1&top=n
GET /api/odk/stats/overview       → KPIs consolidados
GET /api/odk/stats/by-project     → Métricas por projeto
GET /api/odk/stats/by-city        → Métricas por município
GET /api/odk/stats/by-agent       → Ranking de agentes
GET /api/odk/stats/timeline       → Submissões no tempo
GET /api/odk/stats/demographics   → Perfil sociodemográfico
GET /api/odk/stats/rights         → Indicadores de direitos
```

## Docker

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Base | `node:22-alpine` (multi-stage build) |
| Orquestração | Docker Compose |
| Banco | SQLite via `better-sqlite3` (volume `./data:/app/data`) |

### Uso

```bash
# Build + start
docker compose up -d

# Logs
docker compose logs -f

# Seed manual
docker compose run --rm app npx tsx src/db/seed.ts

# Parar
docker compose down
```

O seed roda automaticamente a cada start do container (idempotente — upsert).
O banco SQLite persiste em `./data/dashboard.db`.

### Build notes

- `better-sqlite3` é native addon: Alpine precisa de `python3 make g++` para compilar
- `allowedDevOrigins: ["xps"]` no `next.config.ts` é inofensivo em produção
- `trustHost: true` no NextAuth permite auto-detecção do host no container
- Porta: **3051** (externa e interna)

## Regras

- **Porta**: 3051 (`npm run dev -- -p 3051` / `docker compose up`)
- **Python**: só se necessário, usar `uv` para criar venv local. Sem instalação global.
- **Node**: usar npm/pnpm. Sem instalação global.
- **Escrita no ODK Central**: jamais fazer pelo dashboard. Apenas leitura via proxy.
- **Servidor ODK**: apenas consultas GET/OData. Nunca POST/PUT/DELETE.
- **Credenciais ODK**: reutilizar do projeto `odk_mdhc` (`mdo_prod_config.toml`).
