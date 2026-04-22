# Mentis Sales and Production Planning

Mentis Sales and Production Planning is a Next.js App Router application for sales-order tracking, production planning, and Rectagrid-first production progress monitoring.

The exported v0 dashboard has been refactored into a full-stack baseline with:

- Next.js App Router and TypeScript
- Tailwind CSS and shadcn/ui
- Prisma wired for PostgreSQL
- typed repositories and services
- Zod-validated API routes
- live data contracts for dashboard, pipeline lookup, sales orders, rectagrid, clients, and reference data

## Current scope

The first live production flow is Rectagrid.

Pages wired to the backend foundation:

- Dashboard
- Pipeline View
- Sales Orders
- Production Planning
- Rectagrid
- Clients
- Data References
- Settings

Intentional placeholders remain for:

- Drawings
- Handrailing
- Expanded Metal
- Press Shop
- Punching
- Mentrail
- Reports drill-down actions

## Environment variables

Create a `.env.local` file and populate:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@192.0.0.15:5432/mentis_sales_and_production_planning_and_tracking"
NEXT_PUBLIC_APP_NAME="Mentis Sales and Production Planning"
MENTIS_DEFAULT_STREAM="Rectagrid"
```

## Install and run

1. Install dependencies:

```bash
npm install
```

2. Generate the Prisma client:

```bash
npx prisma generate
```

3. Start the development server:

```bash
npm run dev
```

4. Build for production verification:

```bash
npm run build
```

## Prisma notes

Prisma schema file:

- `prisma/schema.prisma`

Useful commands:

```bash
npx prisma generate
npx prisma db pull
npx prisma studio
```

This baseline models the first relevant PostgreSQL objects:

- `app_core.client`
- `app_core.work_center`
- `sales.sales_order`
- `production_jobbing.rectagrid_job`
- `production_jobbing.rectagrid_step`
- `production_jobbing.rectagrid_punching`
- `data_ref.public_holiday`

## API routes

- `GET /api/dashboard/summary`
- `GET /api/sales-orders`
- `GET /api/sales-orders/[salesOrderNumber]`
- `GET /api/rectagrid/jobs`
- `GET /api/pipeline/[salesOrderNumber]`

All route input parsing is validated with Zod.

## Project structure

```text
app/
  (dashboard)/
  api/
components/
  dashboard/
  pipeline/
  rectagrid/
  sales-orders/
  ui/
lib/
  config/
  db/
  mappers/
  repositories/
  services/
  utils/
  validations/
prisma/
types/
public/
```

## Database expectations

This code assumes the existing Mentis PostgreSQL database exposes the schemas and core objects above, and that the main tables include fields commonly aligned to the current business model, such as:

- sales order number
- client id / client code / client name
- product code
- description
- sqm
- qty
- approval date
- production issued date
- calculated due date
- revised due date
- x-works date
- rectagrid step number / code / name
- planned start and end dates
- actual start and end dates
- status code

If the physical column names differ, update the repository SQL in `lib/repositories/`.

## Verification completed

The current project has been verified with:

- `npx prisma generate`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
