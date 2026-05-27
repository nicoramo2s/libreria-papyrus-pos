# PRD — Papyrus: App Web para Librería & Papelería

**Versión:** 1.1  
**Fecha:** Mayo 2026  
**Estado:** Aprobado para desarrollo  
**Producto:** Papyrus — Sistema de Gestión para Librería y Papelería  

---

## 1. Resumen Ejecutivo

Papyrus es una aplicación web de gestión integral para una librería y papelería homónima. El sistema centraliza tres pilares operativos: **Punto de Venta (POS)**, **Gestión de Productos/Inventario** y **Historial de Ventas con analítica**. El objetivo es reemplazar flujos manuales (planillas, tickets físicos) por una herramienta moderna, rápida y fácil de usar para el personal del local.

### Paleta de colores oficial

| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#1A1A1A` | Texto principal, encabezados |
| `--color-gold` | `#B8922A` | Acentos, CTA, highlights |
| `--color-gold-light` | `#D4A843` | Hover states, íconos secundarios |
| `--color-bg` | `#F5F0E8` | Fondo general (crema) |
| `--color-surface` | `#FFFFFF` | Cards, modales, paneles |
| `--color-border` | `#E2D9C8` | Separadores, bordes sutiles |
| `--color-danger` | `#C0392B` | Errores, eliminar, stock crítico |
| `--color-success` | `#27AE60` | Confirmaciones, stock OK |

### Tipografía

- **Display / Headings:** Playfair Display (serif) — coherente con el logo
- **Body / UI:** Inter (sans-serif) — legibilidad en pantalla

---

## 2. Objetivos del Producto

### Objetivos primarios

- Reducir el tiempo de checkout por cliente a menos de 60 segundos.
- Eliminar el error humano en el cálculo de totales y vuelto.
- Tener visibilidad en tiempo real del stock disponible.
- Generar reportes de ventas sin exportar datos manualmente.

### Objetivos secundarios

- Alertas automáticas de stock bajo para reposición.
- Historial consultable con filtros para análisis de tendencias.
- Soporte para múltiples métodos de pago.
- Gestión de servicios personalizados.
- Soporte para impresiones, plastificados, laminados y trabajos especiales.
- Configuración dinámica de tamaños de hoja y especificaciones.
- Facilidad de uso para personal no técnico.

### Fuera de alcance (v1.0)

- E-commerce / tienda online.
- App móvil nativa (el POS debe funcionar bien en tablet vía browser).
- Integración con sistemas contables externos (AFIP, factura electrónica) — planificado para v1.5.
- Multi-sucursal.
- Gestión de proveedores / órdenes de compra.
- Roles múltiples (Cajero, Encargado) — v1.0 solo tiene rol Admin.

---

## 3. Usuarios y Roles

### 3.1 Roles del sistema (v1.0)

En esta versión inicial existe un único rol operativo:

| Rol | Descripción | Acceso |
|---|---|---|
| **Admin** | Dueño / operador principal del sistema | Acceso total a todos los módulos |

El Admin puede crear otros usuarios Admin si lo requiere. La separación de roles (Cajero, Encargado) se implementará en v1.5.

### 3.2 Autenticación

- Login con **nombre de usuario** (no email) + **contraseña**.
- El nombre de usuario es único en el sistema.
- La contraseña se hashea con **bcrypt** (mínimo 12 rondas).

### 3.3 Perfil del usuario Admin

- Dueño o gerente del negocio.
- Opera el POS directamente en el mostrador.
- Carga y mantiene el catálogo de productos.
- Consulta ventas y reportes.
- Familiaridad tecnológica: media-alta.

---

## 4. Stack Tecnológico

### 4.1 Monorepo

El proyecto se organiza como un **monorepo pnpm** con workspaces:

```
papyrus/
├── apps/
│   ├── api/          # Backend — NestJS
│   └── web/          # Frontend — React + Vite
├── packages/
│   └── shared/       # Tipos TypeScript compartidos (DTOs, enums)
├── pnpm-workspace.yaml
├── package.json
└── .env              # Variables de entorno globales (dev)
```

### 4.2 Backend — `apps/api`

| Capa | Tecnología |
|---|---|
| Framework | **NestJS** (TypeScript) |
| Base de datos | **MySQL 8** |
| ORM | **Prisma** |
| Autenticación | **JWT** (`@nestjs/jwt`) + Passport |
| Hash de contraseñas | **bcrypt** |
| Subida de archivos | **Multer** (almacenamiento local `/uploads`) |
| Validación | `class-validator` + `class-transformer` |
| Documentación API | **Swagger** (`@nestjs/swagger`) |
| Variables de entorno | `@nestjs/config` + `.env` |
| Package manager | **pnpm** |

**Estructura de carpetas `apps/api/src/`:**

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── dto/
│       └── login.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   └── dto/
├── products/
│   ├── products.module.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── dto/
│       ├── create-product.dto.ts
│       └── update-product.dto.ts
├── categories/
│   ├── categories.module.ts
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   └── dto/
├── sales/
│   ├── sales.module.ts
│   ├── sales.controller.ts
│   ├── sales.service.ts
│   └── dto/
│       └── create-sale.dto.ts
├── stock/
│   ├── stock.module.ts
│   ├── stock.controller.ts
│   ├── stock.service.ts
│   └── dto/
├── reports/
│   ├── reports.module.ts
│   ├── reports.controller.ts
│   └── reports.service.ts
├── uploads/               # Archivos estáticos servidos
├── prisma/
│   └── prisma.service.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   └── interceptors/
└── main.ts
```

### 4.3 Frontend — `apps/web`

| Capa | Tecnología |
|---|---|
| Framework | **React 18** (TypeScript) |
| Build tool | **Vite** |
| Routing | **React Router v6** |
| Estado global | **Zustand** |
| HTTP client | **Axios** + React Query (TanStack Query v5) |
| UI Components | **shadcn/ui** (Radix primitives) |
| Estilos | **Tailwind CSS** (paleta extendida con tokens Papyrus) |
| Iconos | **Lucide React** |
| Gráficos | **Recharts** |
| Formularios | **React Hook Form** + **Zod** |
| Notificaciones | **Sonner** (toasts) |
| Package manager | **pnpm** |

**Estructura de carpetas `apps/web/src/`:**

```
src/
├── assets/
│   └── logo.png
├── components/
│   ├── ui/              # shadcn/ui generados
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── pos/
│   │   ├── ProductGrid.tsx
│   │   ├── ProductCard.tsx
│   │   ├── Cart.tsx
│   │   ├── CartItem.tsx
│   │   ├── PaymentSelector.tsx
│   │   └── SaleSuccessModal.tsx
│   ├── products/
│   │   ├── ProductTable.tsx
│   │   ├── ProductForm.tsx
│   │   └── StockBadge.tsx
│   └── shared/
│       ├── DataTable.tsx
│       ├── ConfirmDialog.tsx
│       └── KPICard.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── POSPage.tsx
│   ├── ProductsPage.tsx
│   ├── ProductFormPage.tsx
│   ├── SalesPage.tsx
│   ├── SaleDetailPage.tsx
│   ├── ReportsPage.tsx
│   └── SettingsPage.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── useProducts.ts
├── store/
│   ├── authStore.ts
│   └── cartStore.ts
├── services/
│   └── api.ts           # Instancia Axios configurada
├── lib/
│   └── utils.ts
├── types/               # Re-export desde @papyrus/shared
├── router/
│   └── index.tsx
└── main.tsx
```

### 4.4 Package compartido — `packages/shared`

Tipos TypeScript y enums compartidos entre API y Web:

```
packages/shared/src/
├── enums/
│   ├── PaymentMethod.ts
│   ├── SaleStatus.ts
│   └── StockMovementType.ts
├── types/
│   ├── product.types.ts
│   ├── sale.types.ts
│   └── user.types.ts
└── index.ts
```

---

## 5. Base de Datos — MySQL + Prisma

### 5.1 Schema Prisma completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ─── Usuarios ───────────────────────────────────────────

model User {
  id           String   @id @default(uuid())
  username     String   @unique
  passwordHash String   @map("password_hash")
  displayName  String   @map("display_name")
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  lastLogin    DateTime? @map("last_login")

  sales         Sale[]
  stockMovements StockMovement[]

  @@map("users")
}

// ─── Categorías ─────────────────────────────────────────

model Category {
  id        String    @id @default(uuid())
  name      String    @unique
  icon      String?
  color     String?   @default("#B8922A")
  createdAt DateTime  @default(now()) @map("created_at")

  products Product[]

  @@map("categories")
}

// ─── Productos ──────────────────────────────────────────

model Product {
  id            String    @id @default(uuid())
  name          String
  description   String?   @db.Text
  categoryId    String?   @map("category_id")
  isbn          String?   @unique
  author        String?
  publisher     String?
  purchasePrice Decimal   @map("purchase_price") @db.Decimal(10, 2)
  salePrice     Decimal   @map("sale_price") @db.Decimal(10, 2)
  stock         Int       @default(0)
  stockAlert    Int       @default(5) @map("stock_alert")
  imageUrl      String?   @map("image_url")   // Opcional
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  category       Category?       @relation(fields: [categoryId], references: [id])
  saleItems      SaleItem[]
  stockMovements StockMovement[]

  @@map("products")
}

// ─── Ventas ─────────────────────────────────────────────

model Sale {
  id             String        @id @default(uuid())
  ticketNumber   String        @unique @map("ticket_number")
  userId         String        @map("user_id")
  subtotal       Decimal       @db.Decimal(10, 2)
  discountAmount Decimal       @default(0) @map("discount_amount") @db.Decimal(10, 2)
  total          Decimal       @db.Decimal(10, 2)
  paymentMethod  PaymentMethod @map("payment_method")
  cashReceived   Decimal?      @map("cash_received") @db.Decimal(10, 2)
  changeGiven    Decimal?      @map("change_given") @db.Decimal(10, 2)
  notes          String?       @db.Text
  status         SaleStatus    @default(COMPLETED)
  cancelledBy    String?       @map("cancelled_by")
  cancelReason   String?       @map("cancel_reason") @db.Text
  cancelledAt    DateTime?     @map("cancelled_at")
  createdAt      DateTime      @default(now()) @map("created_at")

  user      User       @relation(fields: [userId], references: [id])
  items     SaleItem[]
  returns   Return[]

  @@map("sales")
}

model SaleItem {
  id              String   @id @default(uuid())

  saleId          String   @map("sale_id")

  productId       String?  @map("product_id")
  serviceId       String?  @map("service_id")

  itemType        SaleItemType @map("item_type")

  productName     String   @map("product_name")

  productPrice    Decimal  @map("product_price") @db.Decimal(10,2)

  quantity        Int

  subtotal        Decimal  @db.Decimal(10,2)

  specifications  Json?

  sale            Sale     @relation(fields: [saleId], references: [id])

  product         Product? @relation(fields: [productId], references: [id])

  service         Service? @relation(fields: [serviceId], references: [id])

  @@map("sale_items")
}


// ─── Servicios ──────────────────────────────────────────

model Service {
  id            String    @id @default(uuid())
  name          String
  description   String?   @db.Text

  basePrice     Decimal   @map("base_price") @db.Decimal(10, 2)

  isActive      Boolean   @default(true) @map("is_active")

  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  variants      ServiceVariant[]
  saleItems     SaleItem[]

  @@map("services")
}

model ServiceVariant {
  id            String    @id @default(uuid())

  serviceId     String    @map("service_id")

  name          String
  description   String?

  price         Decimal   @db.Decimal(10,2)

  createdAt     DateTime  @default(now()) @map("created_at")

  service        Service @relation(fields: [serviceId], references: [id])

  @@map("service_variants")
}

// ─── Devoluciones ───────────────────────────────────────

model Return {
  id            String   @id @default(uuid())
  saleId        String   @map("sale_id")
  userId        String   @map("user_id")
  reason        String   @db.Text
  totalRefunded Decimal  @map("total_refunded") @db.Decimal(10, 2)
  createdAt     DateTime @default(now()) @map("created_at")

  sale        Sale         @relation(fields: [saleId], references: [id])
  returnItems ReturnItem[]

  @@map("returns")
}

model ReturnItem {
  id          String  @id @default(uuid())
  returnId    String  @map("return_id")
  productId   String  @map("product_id")
  quantity    Int
  refundAmount Decimal @map("refund_amount") @db.Decimal(10, 2)

  return Return @relation(fields: [returnId], references: [id])

  @@map("return_items")
}

// ─── Movimientos de Stock ───────────────────────────────

model StockMovement {
  id            String              @id @default(uuid())
  productId     String              @map("product_id")
  userId        String              @map("user_id")
  type          StockMovementType
  quantity      Int
  reason        String?             @db.Text
  previousStock Int                 @map("previous_stock")
  newStock      Int                 @map("new_stock")
  createdAt     DateTime            @default(now()) @map("created_at")

  product Product @relation(fields: [productId], references: [id])
  user    User    @relation(fields: [userId], references: [id])

  @@map("stock_movements")
}

// ─── Configuración ──────────────────────────────────────

model Setting {
  key       String   @id
  value     String   @db.Text
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("settings")
}

// ─── Enums ──────────────────────────────────────────────

enum PaymentMethod {
  CASH
  CARD
  TRANSFER
}

enum SaleStatus {
  COMPLETED
  CANCELLED
  RETURNED
}

enum SaleItemType {
  PRODUCT
  SERVICE
}

enum StockMovementType {
  IN
  OUT
  ADJUSTMENT
}
```

### 5.2 Variables de entorno

```env
# .env (raíz del monorepo)

# Base de datos
DATABASE_URL="mysql://root:password@localhost:3306/papyrus_db"

# JWT
JWT_SECRET="super-secret-key-change-in-production"
JWT_EXPIRES_IN="8h"

# API
API_PORT=3000
API_URL="http://localhost:3000"
UPLOADS_PATH="./uploads"
MAX_FILE_SIZE_MB=2

# Frontend
VITE_API_URL="http://localhost:3000"
```

---

## 6. API REST — Endpoints

### 6.1 Auth

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/auth/login` | Login con username + password | ❌ |
| POST | `/auth/logout` | Invalida refresh token | ✅ |
| GET | `/auth/me` | Datos del usuario autenticado | ✅ |
| POST | `/auth/refresh` | Renueva access token | ✅ |

**Body login:**
```json
{
  "username": "admin",
  "password": "mi-contraseña"
}
```

**Response login:**
```json
{
  "accessToken": "eyJ...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "displayName": "Administrador"
  }
}
```

### 6.2 Productos

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/products` | Listar productos (paginado, filtros) | ✅ |
| GET | `/products/:id` | Obtener producto | ✅ |
| POST | `/products` | Crear producto | ✅ |
| PATCH | `/products/:id` | Editar producto | ✅ |
| DELETE | `/products/:id` | Soft delete | ✅ |
| POST | `/products/:id/image` | Subir imagen (multipart) | ✅ |
| DELETE | `/products/:id/image` | Eliminar imagen | ✅ |

**Query params GET /products:**
- `search` — texto libre (nombre, isbn, autor)
- `categoryId` — filtrar por categoría
- `lowStock` — `true` para ver solo stock crítico
- `isActive` — `true/false`
- `page` — número de página (default: 1)
- `limit` — items por página (default: 20)
- `sortBy` — campo de ordenamiento
- `sortOrder` — `asc/desc`

**Body POST /products:**
```json
{
  "name": "El principito",
  "description": "Novela del autor Antoine de Saint-Exupéry",
  "categoryId": "uuid-categoria",
  "isbn": "9789500420020",
  "author": "Antoine de Saint-Exupéry",
  "publisher": "Emecé",
  "purchasePrice": 800,
  "salePrice": 1200,
  "stock": 15,
  "stockAlert": 3
}
```
> La imagen se sube en un request separado con `multipart/form-data`. No es obligatoria.

### 6.3 Categorías

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/categories` | Listar todas | ✅ |
| POST | `/categories` | Crear | ✅ |
| PATCH | `/categories/:id` | Editar | ✅ |
| DELETE | `/categories/:id` | Eliminar | ✅ |


### 6.3 Servicios

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/services` | Listar servicios | ✅ |
| POST | `/services` | Crear servicio | ✅ |
| PATCH | `/services/:id` | Editar servicio | ✅ |
| DELETE | `/services/:id` | Desactivar servicio | ✅ |

### 6.4 Variantes de Servicios

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/services/:id/variants` | Listar variantes | ✅ |
| POST | `/services/:id/variants` | Crear variante | ✅ |

### 6.5 Ventas

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/sales` | Listar ventas (filtros + paginado) | ✅ |
| GET | `/sales/:id` | Detalle de venta | ✅ |
| POST | `/sales` | Registrar nueva venta | ✅ |
| POST | `/sales/:id/cancel` | Anular venta | ✅ |
| POST | `/sales/:id/return` | Registrar devolución | ✅ |

**Body POST /sales:**
```json
{
  "items": [
    { "productId": "uuid", "quantity": 2 },
    { "productId": "uuid", "quantity": 1 }
  ],
  "discountAmount": 0,
  "paymentMethod": "CASH",
  "cashReceived": 5000,
  "notes": ""
}
```

**Query params GET /sales:**
- `from` — fecha inicio (ISO 8601)
- `to` — fecha fin
- `paymentMethod` — enum
- `status` — enum
- `page`, `limit`, `sortOrder`

### 6.6 Stock

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/stock/movements` | Historial de movimientos | ✅ |
| POST | `/stock/adjust` | Ajuste manual de stock | ✅ |

**Body POST /stock/adjust:**
```json
{
  "productId": "uuid",
  "type": "IN",
  "quantity": 20,
  "reason": "Reposición de mercadería"
}
```

### 6.7 Reportes

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/reports/dashboard` | KPIs del dashboard | ✅ |
| GET | `/reports/sales-by-period` | Ventas agrupadas por día | ✅ |
| GET | `/reports/top-products` | Top 10 productos | ✅ |
| GET | `/reports/sales-by-payment` | Desglose por método de pago | ✅ |
| GET | `/reports/low-stock` | Productos con stock bajo | ✅ |

### 6.8 Uploads (archivos estáticos)

```
GET /uploads/:filename   → Sirve la imagen del producto
```

---

## 7. Módulos y Funcionalidades

### 7.1 MÓDULO: Autenticación

#### Pantalla de Login

- Fondo crema (`#F5F0E8`), logo Papyrus centrado.
- Campos: **Nombre de usuario** + **Contraseña**.
- Botón "Ingresar" en dorado.
- Mensaje de error claro si credenciales incorrectas: *"Usuario o contraseña incorrectos"*.
- Sin registro público — los usuarios solo los crea el Admin desde Settings.
- Bloqueo temporal tras 5 intentos fallidos consecutivos (15 min cooldown, registrado en backend).

#### Comportamiento de sesión

- Al hacer login exitoso → se almacena el JWT en `localStorage` (o `httpOnly cookie` según preferencia del equipo).
- El token expira en 8 horas (1 jornada laboral).
- Al expirar → redirige a `/login` automáticamente.
- Todas las rutas protegidas validan el token via `JwtAuthGuard` en NestJS.

---

### 7.2 MÓDULO: Dashboard

KPIs visibles al Admin al ingresar:

| KPI | Fuente |
|---|---|
| Ventas del día ($) | SUM(total) WHERE date = today AND status = COMPLETED |
| N° de transacciones hoy | COUNT(sales) WHERE date = today |
| Ticket promedio | ventas_dia / transacciones_dia |
| Producto más vendido hoy | TOP 1 de sale_items agrupado por producto |
| Productos en stock crítico | COUNT WHERE stock <= stockAlert |

**Widgets:**
- Gráfico de barras: ventas totales últimos 7 días.
- Lista: 5 productos con stock más bajo.
- Lista: últimas 5 ventas (número de ticket, total, hora).
- Botón destacado: **"Ir al POS"**.

---

### 7.3 MÓDULO: Punto de Venta (POS)

Layout de dos columnas (mínimo 768px).

El POS permite vender tanto productos físicos como servicios personalizados.

Pestañas principales:

```txt
[Productos] [Servicios]
```

Los servicios pueden solicitar especificaciones dinámicas como tamaño de hoja, color, cantidad de páginas, tipo de laminado, entre otros.

Ejemplo:

```txt
Tipo: Color
Tamaño: A4
Cantidad de hojas: 15
Doble faz: Sí
```

Layout de dos columnas (mínimo 768px):

```
┌─────────────────────────┬──────────────────────────────┐
│  [🔍 Buscar producto]   │  🛒 Carrito                  │
│                         │                              │
│  Pills de categoría:    │  El principito    x1  $1.200 │
│  [Todos][Libros][...]   │  Cuaderno A4      x2  $1.400 │
│                         │  ─────────────────────────── │
│  ┌────┐ ┌────┐ ┌────┐  │  Subtotal:          $2.600   │
│  │    │ │    │ │    │  │  Descuento:         -$0       │
│  │Prod│ │Prod│ │Prod│  │  TOTAL:             $2.600   │
│  │    │ │    │ │    │  │                              │
│  └────┘ └────┘ └────┘  │  Método de pago:             │
│                         │  [Efectivo][Débito][Crédito] │
│  ┌────┐ ┌────┐ ┌────┐  │  [Transferencia]             │
│  │    │ │    │ │    │  │                              │
│  └────┘ └────┘ └────┘  │  [  LIMPIAR  ] [  COBRAR ▶ ]│
└─────────────────────────┴──────────────────────────────┘
```

#### Búsqueda

- Barra con debounce 250ms → llama a `GET /products?search=xxx&isActive=true`.
- También acepta input de **scanner de código de barras** (busca por ISBN; al presionar Enter con 1 solo resultado lo agrega).
- Filtrado por categoría via pills.
- Cards con: imagen (o ícono placeholder si no tiene), nombre, precio, badge de stock.
- Click en card → agrega al carrito (si stock > 0).
- Productos sin stock: card deshabilitada visualmente.

#### Carrito

- Gestionado con **Zustand** (`cartStore.ts`).
- Persiste en `sessionStorage` (anti-recarga accidental).
- Controles: + / - por ítem, eliminar ítem.
- Campo de descuento: monto fijo ($) o porcentaje (%).
- Total siempre visible y actualizado en tiempo real.

#### Cobro

- Selección de método de pago (exclusivo).
- Si Efectivo: campo "Monto recibido" → vuelto automático.
- Botón COBRAR → llama `POST /sales`.
- Modal de confirmación antes de ejecutar.
- Pantalla de éxito con número de ticket y vuelto.
- Opción: imprimir ticket (`window.print()` con CSS @media print).

#### Reglas de negocio

- No se puede cobrar con carrito vacío.
- Stock se valida también en backend al confirmar la venta.
- Descuento no puede hacer el total negativo.
- Una venta completada no se puede editar; solo anular o devolver.

---


### 7.3 MÓDULO: Gestión de Servicios

El sistema soporta servicios personalizados como:

- Impresiones
- Fotocopias
- Plastificados
- Laminados
- Anillados

Cada servicio puede tener variantes y especificaciones dinámicas.

#### Ejemplos de especificaciones

**Impresión:**

```json
{
  "paperSize": "A4",
  "color": true,
  "pages": 15,
  "doubleSide": false
}
```

**Plastificado:**

```json
{
  "size": "A3",
  "finish": "mate"
}
```

#### Funcionalidades

- CRUD completo de servicios.
- Configuración de variantes.
- Configuración de precios dinámicos.
- Compatibilidad con múltiples tamaños de hoja.
- Registro de especificaciones por venta.
- Integración total con el POS.

### 7.4 MÓDULO: Gestión de Productos

#### Listado

- Tabla paginada con columnas: imagen, nombre, categoría, ISBN, precio costo, precio venta, margen %, stock, estado, acciones.
- Búsqueda, filtros por categoría/estado/stock bajo.
- Exportar a CSV.
- Botón "Nuevo producto".

#### Formulario (crear/editar)

**Datos básicos:**
- Nombre * (requerido)
- Descripción (textarea, opcional)
- Categoría * (select + crear nueva inline)
- Autor, Editorial (opcionales)
- ISBN / Código de barras (opcional, único)

**Precios:**
- Precio de costo * (requerido)
- Precio de venta * (requerido)
- Margen % calculado automáticamente (display)

**Inventario:**
- Stock inicial *
- Umbral de alerta (default: 5)

**Imagen (opcional):**
- Upload drag & drop o click.
- Preview inmediato.
- Formatos: JPG, PNG, WEBP. Máx. 2MB.
- Si no se sube imagen → se muestra un ícono/placeholder genérico en el POS y el listado.
- Botón para eliminar imagen existente.

#### Ajuste de stock

- Modal accesible desde la tabla.
- Tipo: IN (entrada) / OUT (salida) / ADJUSTMENT (corrección).
- Cantidad + motivo.
- Se registra en `stock_movements`.

---

### 7.5 MÓDULO: Historial de Ventas

- Tabla con: N° ticket, fecha/hora, cajero, ítems, total, método de pago, estado.
- Filtros: rango de fechas, método de pago, estado.
- Búsqueda por N° de ticket.
- Exportar a CSV.

**Detalle de venta:**
- Tabla de ítems, totales, método de pago, vuelto.
- Botones según estado: [Reimprimir ticket] [Anular] [Registrar devolución].

**Anulación:**
- Requiere motivo.
- Restaura stock de todos los ítems.
- Registra quién anuló y cuándo.

**Devolución:**
- Selección de ítems a devolver y cantidades.
- Restaura stock de los ítems devueltos.
- Genera registro en tabla `returns`.

---

### 7.6 MÓDULO: Reportes

- Ventas por período (gráfico de línea + tabla).
- Top 10 productos más vendidos.
- Desglose por método de pago (gráfico torta).
- Productos con stock bajo.
- Exportar a PDF/CSV.

---

### 7.7 MÓDULO: Configuración

- **Datos del negocio:** nombre, dirección, teléfono, mensaje de ticket.
- **Gestión de usuarios:** crear, editar, activar/desactivar (todos son Admin).
- **Categorías:** CRUD completo.
- **Parámetros POS:** descuento máximo %, prefijo de ticket.

---

## 8. Estructura de Archivos del Monorepo

```
papyrus/
│
├── apps/
│   │
│   ├── api/                          # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   ├── sales/
│   │   │   ├── stock/
│   │   │   ├── reports/
│   │   │   ├── uploads/
│   │   │   ├── prisma/
│   │   │   ├── common/
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts               # Admin inicial + categorías base
│   │   ├── uploads/                  # Imágenes de productos (gitignored)
│   │   ├── .env
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── web/                          # React + Vite Frontend
│       ├── src/
│       │   ├── assets/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── store/
│       │   ├── services/
│       │   ├── lib/
│       │   ├── router/
│       │   └── main.tsx
│       ├── public/
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/                       # Tipos compartidos
│       ├── src/
│       │   ├── enums/
│       │   ├── types/
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── pnpm-workspace.yaml
├── package.json                      # Scripts raíz (dev, build, lint)
├── .env                              # Variables globales
├── .gitignore
└── README.md
```

---

## 9. Setup y Comandos

### 9.1 Requisitos previos

- Node.js >= 20
- pnpm >= 9
- MySQL 8 corriendo localmente

### 9.2 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/papyrus.git
cd papyrus

# Instalar dependencias de todo el monorepo
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MySQL

# Correr migraciones y seed inicial
pnpm --filter api prisma migrate dev
pnpm --filter api prisma db seed
# → Crea usuario admin: username=admin / password=admin123
# → Crea categorías base: Libros, Papelería, Cuadernos, Útiles, Arte, Regalos, Otros
```

### 9.3 Scripts principales

```bash
# Desarrollo (ambas apps en paralelo)
pnpm dev

# Solo backend
pnpm --filter api dev

# Solo frontend
pnpm --filter web dev

# Build producción
pnpm build

# Tests
pnpm test

# Prisma Studio (GUI de la DB)
pnpm --filter api prisma studio

# Nueva migración
pnpm --filter api prisma migrate dev --name nombre_migracion
```

### 9.4 pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 9.5 package.json raíz

```json
{
  "name": "papyrus",
  "private": true,
  "scripts": {
    "dev": "pnpm run --parallel dev",
    "build": "pnpm run --recursive build",
    "lint": "pnpm run --recursive lint",
    "test": "pnpm run --recursive test"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}
```

---

## 10. Seguridad

- Contraseñas hasheadas con **bcrypt** (12 rondas).
- JWT con expiración de 8h. Secreto en variable de entorno, nunca en código.
- `JwtAuthGuard` aplicado globalmente en NestJS; rutas públicas marcadas con decorador `@Public()`.
- Rate limiting en `POST /auth/login`: máx. 5 intentos / 15 min por IP (usando `@nestjs/throttler`).
- Validación estricta de inputs con `class-validator` en todos los DTOs.
- Archivos de imagen validados: tipo MIME y tamaño máximo (2MB) en Multer.
- CORS configurado solo para el origen del frontend.
- Variables sensibles nunca en el repositorio (`.env` en `.gitignore`).
- Logs de auditoría en: login/logout, ventas, anulaciones, ajustes de stock.

---

## 11. Requisitos No Funcionales

| Requisito | Objetivo |
|---|---|
| Tiempo de carga del POS | < 2 segundos |
| Respuesta de búsqueda en POS | < 300ms |
| Tiempo de procesamiento de venta | < 1 segundo |
| Uptime en horario comercial | > 99% |
| Soporte de ancho mínimo | 768px (tablet) |
| Tamaño máximo de imagen de producto | 2MB |
| Registros en tabla de ventas sin degradación | Hasta 100.000 registros |

---

## 12. Plan de Desarrollo por Fases

### Fase 1 — Core MVP (4–5 semanas)

- [ ] Setup monorepo pnpm + configuración TypeScript
- [ ] Schema Prisma + migraciones iniciales + seed
- [ ] Módulo Auth NestJS (login username/password, JWT, guard)
- [ ] CRUD Categorías (API + UI)
- [ ] CRUD Productos con imagen opcional (API + UI)
- [ ] Módulo POS: búsqueda, carrito (Zustand), cobro
- [ ] Registro de ventas y descuento de stock
- [ ] Historial de ventas (listado + detalle)

### Fase 2 — Completitud (3–4 semanas)

- [ ] Anulación y devoluciones
- [ ] Ajuste manual de stock + log de movimientos
- [ ] Dashboard con KPIs y gráficos
- [ ] Módulo de reportes
- [ ] Exportación CSV/PDF
- [ ] Impresión de ticket (CSS @media print)
- [ ] Gestión de usuarios desde Settings
- [ ] Alertas de stock crítico

### Fase 3 — Pulido (2 semanas)

- [ ] Atajos de teclado en POS
- [ ] Búsqueda por scanner de código de barras
- [ ] Tests unitarios (lógica de ventas, stock)
- [ ] Tests E2E flujo principal de venta
- [ ] Documentación Swagger de la API
- [ ] README completo de instalación y uso

### Fase 4 — Futuro (v1.5+)

- [ ] Roles: Cajero, Encargado
- [ ] Factura electrónica (AFIP)
- [ ] Modo offline del POS
- [ ] Multi-sucursal
- [ ] Envío de reportes por email

---

## 13. Métricas de Éxito

| Métrica | Objetivo |
|---|---|
| Tiempo promedio de venta en POS | < 60 segundos |
| Errores de stock por mes | 0 |
| Adopción por el equipo | 100% en 7 días post-deploy |
| Tiempo para cargar 50 productos | < 45 minutos |
| Disponibilidad en horario comercial | > 99% |

---

## 14. Glosario

| Término | Definición |
|---|---|
| POS | Point of Sale — Punto de Venta |
| Ticket | Comprobante de venta con número correlativo (ej: PAP-00042) |
| Carrito | Conjunto de productos en una venta en curso (estado local) |
| Stock | Unidades disponibles de un producto |
| Stock crítico | Stock ≤ umbral de alerta configurado por producto |
| Vuelto | Diferencia entre monto recibido y total de venta (solo efectivo) |
| Anulación | Cancelación de toda una venta; restaura el stock completo |
| Devolución | Cancelación parcial de ítems de una venta; restaura stock parcial |
| Ajuste de stock | Modificación manual del inventario sin asociarse a una venta |
| Soft delete | El registro no se elimina físicamente; `isActive = false` |
| Snapshot | Copia de datos (precio, nombre) al momento de la venta para auditoría |
| Seed | Script que carga datos iniciales (usuario admin, categorías base) |

---

*Documento elaborado para el producto Papyrus — Librería & Papelería.*  
*Versión 1.1 — Mayo 2026.*  
*Stack: NestJS + React + MySQL + Prisma + pnpm monorepo.*
