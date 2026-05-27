# Papyrus — Sistema de Gestión para Librería & Papelería

POS (Point of Sale) + inventario + historial de ventas + reportes.

## Stack

```
apps/
├── api/     # NestJS + Prisma + MySQL — Backend REST
├── web/     # React 18 + Vite + shadcn/ui — Frontend SPA
packages/
└── shared/  # Tipos y enums TypeScript compartidos
```

## Requisitos

- Node.js >= 20
- pnpm >= 9
- MySQL 8

## Setup

```bash
pnpm install
cp .env.example .env
# Editar DATABASE_URL en .env
pnpm --filter api prisma migrate dev
pnpm --filter api prisma db seed      # admin / admin123
pnpm dev                              # API :3000 + Web :5173
```

## Comandos

| Comando | Descripción |
|---|---|
| `pnpm dev` | API + Web en paralelo |
| `pnpm build` | Build producción |
| `pnpm --filter api prisma studio` | GUI base de datos |
| `pnpm --filter api dev` | Solo backend |
| `pnpm --filter web dev` | Solo frontend |

## API Docs

Swagger en `http://localhost:3000/api/docs`

## Seed

Usuario inicial: `admin` / `admin123`
