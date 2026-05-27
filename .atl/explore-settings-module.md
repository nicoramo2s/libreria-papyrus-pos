# Settings Module — Codebase Exploration

> **Date:** 2026-05-25  
> **Project:** Papyrus Librería POS  
> **Scope:** Frontend implementation of Section 7.7 (Settings module)

---

## 1. Complete API Contracts

### 1.1 Settings — Business Data & POS Parameters

**Base path:** `/settings`  
**Auth:** Bearer token required (`@ApiBearerAuth()`)

#### `GET /settings` — Get all settings

Returns a flat object with all known keys:

```typescript
// Response: Record<string, string>
{
  "business_name": "Papyrus Librería",
  "business_address": "Av. Siempre Viva 123",
  "business_phone": "+54 11 5555-1234",
  "ticket_message": "¡Gracias por su compra!",
  "ticket_prefix": "FAC",
  "max_discount_percent": "15",
  "next_ticket_number": "1001"
}
```

Known keys (from `SettingsService.KNOWN_KEYS`):

| Key | Type | Purpose |
|---|---|---|
| `business_name` | string | Business name |
| `business_address` | string | Business address |
| `business_phone` | string | Phone number |
| `ticket_message` | string | Footer message on ticket |
| `ticket_prefix` | string | Ticket number prefix (e.g. "FAC") |
| `max_discount_percent` | string | Max discount as string number (e.g. "15") |
| `next_ticket_number` | string | Auto-incrementing ticket counter |

#### `PUT /settings` — Bulk update settings

```typescript
// Request body:
{
  "settings": {
    "business_name": "New Name",
    "ticket_message": "New message"
    // ...any subset of known keys
  }
}

// Response: Record<string, string> — returns ALL settings after update
```

Validation: rejects unknown keys with `400 Bad Request`.

#### `GET /settings/:key` — Get single setting

```typescript
// Response: Record<string, string> — e.g. { "business_name": "..." }
```

#### `PUT /settings/:key` — Update single setting

```typescript
// Request body: { "value": "new value" }
// Response: { [key]: "new value" }
```

---

### 1.2 Users — Admin User Management

**Base path:** `/users`  
**Auth:** Bearer token required

#### `GET /users` — List all users

```typescript
// Response: Array of:
interface User {
  id: string;
  username: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;        // ISO datetime
  lastLogin?: string;       // ISO datetime, optional
}
```

Note: `passwordHash` is NEVER returned (Prisma select excludes it).

#### `GET /users/:id` — Get single user

Same shape as above.

#### `POST /users` — Create user

```typescript
interface CreateUserDto {
  username: string;     // unique
  displayName: string;
  password: string;     // min 6 chars
}

// Response: User (without password)
```

Returns `409 Conflict` if username already exists.

#### `PATCH /users/:id` — Update user

```typescript
interface UpdateUserDto {
  displayName?: string;
  password?: string;    // min 6 chars if provided
  isActive?: boolean;   // boolean, for activate/deactivate
}

// Response: User (without password)
```

Note: `PATCH` (not `PUT`) — partial updates only. There is **no DELETE** endpoint — users are activated/deactivated via `isActive`.

---

### 1.3 Categories — CRUD

**Base path:** `/categories`  
**Auth:** Bearer token required

#### `GET /categories` — List all categories

```typescript
// Response: Array of:
interface Category {
  id: string;
  name: string;         // unique
  icon?: string;
  color?: string;       // default: "#B8922A"
  createdAt: string;    // ISO datetime
  _count: {
    products: number;   // number of products in this category
  };
}
```

Ordered by `name` ascending.

#### `POST /categories` — Create category

```typescript
interface CreateCategoryDto {
  name: string;
  icon?: string;
  color?: string;       // default: "#B8922A"
}

// Response: Category (with _count.products = 0)
```

`409 Conflict` if name already exists.

#### `PATCH /categories/:id` — Update category

```typescript
interface UpdateCategoryDto {
  name?: string;
  icon?: string;
  color?: string;
}

// Response: Category
```

`409 Conflict` if new name collides with existing category (different id).

#### `DELETE /categories/:id` — Delete category

```typescript
// Response: { ...deleted category }
// Returns 400 if category has associated products
```

**Important:** The backend blocks deletion if `_count.products > 0`. Returned as `400 Bad Request` with message `"No se puede eliminar la categoría porque tiene productos asociados"`.

---

## 2. Existing Frontend Patterns

### 2.1 Technology Stack

| Concern | Library |
|---|---|
| HTTP Client | Axios (via `@/services/api.ts`) |
| Server state | TanStack React Query v5 |
| Forms | react-hook-form + zod resolver |
| Routing | react-router-dom v6 (createBrowserRouter) |
| State (client) | Zustand with persist middleware |
| CSS | Tailwind CSS |
| UI primitives | Radix UI (Select, Dialog, DropdownMenu, Checkbox) |
| Icons | lucide-react |
| Toasts | sonner |
| Path alias | `@/` → `apps/web/src`, `@papyrus/shared` → `packages/shared/src` |

### 2.2 API Client Pattern (`services/api.ts`)

```typescript
// Axios instance with:
// - baseURL from VITE_API_URL (default localhost:3000)
// - Bearer token injected via request interceptor
// - 401 → auto-logout via response interceptor
// Prefixed: NEVER used directly in pages — service modules wrap it.
```

### 2.3 Service Pattern (e.g., `services/products.ts`)

```typescript
// - Pure object with methods (not classes)
// - Each method calls api.{method} and returns response.data
// - Typed with shared types from @papyrus/shared
// - Always returns Promise<T> from response.data
```

### 2.4 React Query Hook Pattern (`hooks/useProducts.ts`)

```typescript
// Pattern:
// 1. Export a queryKey factory: export const productsQueryKey = (params) => ['products', params]
// 2. Export a useXxx hook wrapping useQuery({ queryKey, queryFn })
//    - queryFn calls the service method (or api directly, inconsistently)
// 3. Export useCreateXxx, useUpdateXxx, useDeleteXxx wrapping useMutation
//    - mutationFn calls the service method
//    - onSuccess invalidates queryKey
```

**NOTES:**
- Some hooks call `api` directly inside `queryFn` instead of going through the service layer (inconsistency observed in `useProducts.ts` vs `useCreateProduct` calling `productsService`).
- Recommended: keep the service layer fully isolated, hooks only call service methods.

### 2.5 Page Pattern (`ProductsPage.tsx`)

Structure:
1. **State** — search, filters, pagination, form mode, selected entity
2. **Search debounce** — 250ms via `useEffect`/`setTimeout`
3. **Mutations** — destructured from useMutation hooks (`mutate, isPending`)
4. **Handlers** — `handleEdit`, `handleDelete`, `handleFormSubmit`, etc.
5. **Render**:
   - Header with title + "Create" button
   - Filters row (search input, selects, checkboxes)
   - Data table component
   - Pagination controls
   - Empty state
   - Modal overlay (form) — fixed inset-0 with backdrop
   - Confirm delete modal

### 2.6 Form Pattern (`ProductForm.tsx`)

```typescript
// react-hook-form + @hookform/resolvers/zod
// Schema: z.object({ ... }) with .refine for validations
// useForm({ resolver: zodResolver(schema), defaultValues })
// Controller for Radix Select components
// Fieldset + legend for sections (Información básica, Precios, etc.)
// form.register('field') for Input components
// form.formState.errors.field?.message for inline validation
// useQuery to fetch existing entity data (edit mode only)
// useEffect + form.reset to populate on data load
```

### 2.7 Table Pattern (`ProductTable.tsx`)

```typescript
// Props: data array, onEdit, onDelete, additional action callbacks
// Empty state: centered message
// Standard HTML <table> with <thead>/<tbody>
// Action buttons column with Edit (lucide Edit), Delete (Trash2)
// Uses Button with variant="secondary" size="sm" for table actions
```

### 2.8 Modal Pattern (`ProductsPage.tsx`)

```typescript
// Modal overlay:
// <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//   <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
// Modal header with title + close button
// Content with form component
//
// Confirm delete uses <ConfirmDeleteModal /> (wraps Radix Dialog)
```

### 2.9 Toast Pattern

`sonner` Toaster is rendered in `main.tsx` at root level. Components call `toast.success()`, `toast.error()`, etc. directly.

---

## 3. Design Tokens

### 3.1 Colors (from `tailwind.config.ts`)

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#1A1A1A` | Text, headings |
| `gold` | `#B8922A` | Accents, CTAs, highlights |
| `gold-light` | `#D9BE6C` | Hover states, secondary icons |
| `bg` | `#F5F0E8` | Page background (creamy parchment) |
| `surface` | `#FFFFFF` | Cards, modals, panels |
| `border` | `#E6DCCB` | Borders, separators |
| `danger` | `#B42318` | Errors, delete, critical stock |
| `success` | `#2F6B3F` | Confirmations, stock OK |

### 3.2 Typography

- **Headings:** `Playfair Display` (serif) — `font-heading` class
- **Body/UI:** `Inter` (sans-serif) — default
- **Headings use** `tracking-tight`

### 3.3 Shadows

| Token | Value |
|---|---|
| `shadow-papyrus` | `0 18px 50px rgba(26, 26, 26, 0.08)` |
| `shadow-papyrus-sm` | `0 10px 30px rgba(26, 26, 26, 0.06)` |

### 3.4 Backgrounds

| Token | Value |
|---|---|
| `bg-paper-grain` | `radial-gradient(circle at 1px 1px, rgba(184, 146, 42, 0.08) 1px, transparent 0)` |

### 3.5 CSS Variables (from `index.css`)

```css
:root {
  --papyrus-bg: #f5f0e8;
  --papyrus-surface: #ffffff;
  --papyrus-text: #1a1a1a;
  --papyrus-gold: #b8922a;
  --papyrus-gold-light: #d9be6c;
  --papyrus-border: #e6dccb;
  --papyrus-danger: #b42318;
  --papyrus-success: #2f6b3f;
}
```

### 3.6 Component Classes (from `index.css`)

```css
.paper-panel {
  @apply border border-border/80 bg-surface/90 shadow-papyrus backdrop-blur;
}
.focus-ring {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg;
}
```

### 3.7 Body Background Gradient

```css
body {
  background:
    radial-gradient(circle at top left, rgba(217, 190, 108, 0.24), transparent 34rem),
    linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(245, 240, 232, 0.92)),
    var(--papyrus-bg);
}
```

---

## 4. SettingsPage.tsx Current State

The current page at `apps/web/src/pages/SettingsPage.tsx` is a **placeholder stub**:

```tsx
import { Settings } from 'lucide-react';
import PlaceholderPage from './PlaceholderPage';

export default function SettingsPage() {
  return (
    <PlaceholderPage
      icon={Settings}
      eyebrow="Ajustes"
      title="La administración de usuarios y preferencias se modelará después."
      description="Queda preparado para datos de librería, permisos, parámetros de caja y configuración operativa."
    />
  );
}
```

It renders the generic `PlaceholderPage` component which displays an icon, a badge, a title, and a description card.

---

## 5. Sidebar Navigation — Settings Link

**Yes, Settings link already exists** in `Sidebar.tsx`:

```typescript
const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, end: true },
  { name: 'Punto de venta', href: '/pos', icon: ShoppingCart },
  { name: 'Catálogo', href: '/products', icon: BookOpen },
  { name: 'Ventas', href: '/sales', icon: ReceiptText },
  { name: 'Reportes', href: '/reports', icon: BarChart3 },
  { name: 'Ajustes', href: '/settings', icon: Settings },
];
```

And in `Header.tsx`, the title metadata is already defined:

```typescript
const titles: Record<string, { eyebrow: string; title: string }> = {
  // ...
  '/settings': { eyebrow: 'Administración', title: 'Ajustes' },
};
```

The route is registered in `router/index.tsx`:

```typescript
{ path: 'settings', element: <SettingsPage /> },
```

**No changes needed** to navigation, routing, or header.

---

## 6. Existing Services, Hooks & Shared Types

### 6.1 Services that exist

| File | Exists? | Notes |
|---|---|---|
| `services/api.ts` | ✅ | Axios instance |
| `services/products.ts` | ✅ | Reference pattern |
| `services/settings.ts` | ❌ | **Needs creation** |
| `services/users.ts` | ❌ | **Needs creation** |
| `services/categories.ts` | ❌ | **Needs creation** (see note below) |

> **Important:** Categories **already have a query hook** at `hooks/useCategories.ts` but only a `useQuery` hook (no CRUD mutations). No service file exists — the hook calls `api.get('/categories')` directly. A service + mutations must be created for category CRUD in settings.

### 6.2 Hooks that exist

| File | Exists? | Notes |
|---|---|---|
| `hooks/useProducts.ts` | ✅ | Full CRUD + query key pattern |
| `hooks/useCategories.ts` | ✅ | **Read-only query only** — needs mutations added |
| `hooks/useSettings.ts` | ❌ | **Needs creation** |
| `hooks/useUsers.ts` | ❌ | **Needs creation** |

### 6.3 Shared types from `@papyrus/shared`

| Type | Defined? | Notes |
|---|---|---|
| `User` | ✅ | id, username, displayName, isActive, createdAt, lastLogin |
| `Category` | ✅ | id, name, icon?, color?, createdAt |
| `CreateUserDto` | ❌ | **Not in shared types** |
| `UpdateUserDto` | ❌ | **Not in shared types** |
| `CreateCategoryDto` | ❌ | **Not in shared types** |
| `UpdateCategoryDto` | ❌ | **Not in shared types** |
| `Setting` type | ❌ | **Not in shared types** — backend returns `Record<string, string>` |

> **Decision:** Since the backend DTOs are simple, we can define these types locally in each service/hook file or add them to `@papyrus/shared`. Recommended: add to shared package for consistency.

### 6.4 UI Components available

| Component | Props / Variants |
|---|---|
| `Button` | variant: `primary` \| `secondary` \| `ghost` \| `danger`; size: `sm` \| `md` \| `lg`; isLoading |
| `Input` | label, error, helpText, + all input HTML attrs |
| `Textarea` | label, error, helpText, + all textarea attrs |
| `Select` | Radix-based: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` |
| `Checkbox` | Radix-based: checked, onCheckedChange |
| `Card` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| `Badge` | variant: `neutral` \| `success` \| `danger` \| `gold` |
| `ConfirmDeleteModal` | Radix Dialog: title, description, onConfirm, onCancel |
| `DropdownMenu` | Radix-based: full menu system |
| `StockBadge` | Specialized (not reusable for settings) |
| `cn()` | `clsx` + `tailwind-merge` utility |

---

## 7. Recommended Component Structure

Based on the existing patterns, here is the recommended structure for the Settings module:

### 7.1 New Files to Create

```
apps/web/src/
├── services/
│   ├── settings.ts          # NEW — settings API calls
│   ├── users.ts             # NEW — users API calls
│   └── categories.ts        # NEW — categories CRUD API calls
├── hooks/
│   ├── useSettings.ts       # NEW — settings query + mutation hooks
│   ├── useUsers.ts          # NEW — users CRUD mutation hooks
│   └── useCategories.ts     # MODIFY — add mutations for CRUD
├── components/
│   └── settings/            # NEW directory for settings components
│       ├── BusinessDataForm.tsx    # Business info form
│       ├── PosParametersForm.tsx   # POS params (max discount, ticket prefix)
│       ├── UserTable.tsx           # Users list table
│       ├── UserForm.tsx            # Create/edit user form
│       ├── CategoryTable.tsx       # Categories list table
│       └── CategoryForm.tsx        # Create/edit category form
└── pages/
    └── SettingsPage.tsx     # MODIFY — replace placeholder with real UI
```

### 7.2 Architecture per Feature

#### Business Data + POS Parameters (Settings)

Since both are handled by `PUT /settings` (bulk update), they should be combined into a **single form** with two `<fieldset>` sections (matching the `ProductForm` pattern):

```
SettingsPage.tsx
└── BusinessDataForm.tsx     # fields: business_name, business_address, business_phone, ticket_message
└── PosParametersForm.tsx    # fields: max_discount_percent, ticket_prefix
    (Both in a single <form> that calls PUT /settings with all values)
```

**Hook:** `useSettings` — one `useQuery(['settings'], GET /settings)` + one `useMutation(PUT /settings)` that invalidates `['settings']`.

#### User Management

```
SettingsPage.tsx
└── UserTable.tsx
    └── Button "Nuevo usuario" → opens UserForm modal
    └── Each row: Edit (PATCH) | Toggle active/inactive (PATCH isActive)
└── UserForm.tsx (modal, like ProductForm)
└── ConfirmDeleteModal → BUT there's no delete — use PATCH isActive instead
```

**Important:** No DELETE endpoint. "Delete" in the PRD is actually "deactivate" (`isActive: false`). The UI should reflect this (toggle switch or "Activar/Desactivar" button).

**Hook:** `useUsers` — `useQuery(['users'], GET /users)` + `useCreateUser(POST /users)` + `useUpdateUser(PATCH /users/:id)` — all invalidating `['users']`.

#### Category Management

```
SettingsPage.tsx
└── CategoryTable.tsx
    └── Button "Nueva categoría" → opens CategoryForm modal
    └── Each row: Edit | Delete (with ConfirmDeleteModal)
└── CategoryForm.tsx (modal)
```

**Hook:** Extend `useCategories.ts` — add `useCreateCategory`, `useUpdateCategory`, `useDeleteCategory` mutations, all invalidating `['categories']`.

### 7.3 Layout on SettingsPage

Since Settings has 3 distinct sections (business, users, categories), use the **Card component** pattern for each section:

```tsx
<div className="p-6 space-y-6">
  {/* Header */}
  <div>...</div>
  
  {/* Section 1: Business Data & POS Parameters */}
  <Card>
    <CardHeader>
      <CardTitle>Datos del negocio</CardTitle>
      <CardDescription>Información principal de la librería</CardDescription>
    </CardHeader>
    <CardContent>
      <form>...</form>
    </CardContent>
  </Card>
  
  {/* Section 2: User Management */}
  <Card>
    <CardHeader>
      <CardTitle>Usuarios</CardTitle>
      <CardDescription>Gestión de administradores del sistema</CardDescription>
    </CardHeader>
    <CardContent>
      <UserTable />
    </CardContent>
  </Card>
  
  {/* Section 3: Category Management */}
  <Card>
    <CardHeader>
      <CardTitle>Categorías</CardTitle>
      <CardDescription>Clasificación de productos</CardDescription>
    </CardHeader>
    <CardContent>
      <CategoryTable />
    </CardContent>
  </Card>
</div>
```

### 7.4 Existing Patterns to Follow

1. **Forms:** `react-hook-form` + `zod` validation + `<fieldset>` sections + `<legend>` with `text-lg font-semibold text-primary`
2. **Modals:** `fixed inset-0 bg-black/50` overlay with centered white card
3. **Tables:** standard `<table>` with `<thead>`/`<tbody>`, action buttons with `variant="secondary" size="sm"`
4. **Confirms:** `ConfirmDeleteModal` wrapping Radix Dialog
5. **Mutations:** `useMutation` + `queryClient.invalidateQueries` on success + `toast.success/error` for feedback
6. **Loading states:** `Loader2` with `animate-spin` + centered flex
7. **Empty states:** centered message in gray
8. **Debounced search:** not needed for settings (no search needed here)
9. **Error display:** Inline on Input components via `error` prop; form-level via `toast.error`

---

## 8. Key Design Decisions & Gotchas

### 8.1 Bulk save vs individual save for settings
The backend has both `PUT /settings/:key` (single) and `PUT /settings` (bulk). **Use bulk save** for the settings form — collect all business and POS fields and send them in one request. This matches the PRD intent of "Business Data" + "POS Parameters" as one save action.

### 8.2 No DELETE for users
Users cannot be deleted from the backend. The PRD says "activar/desactivar" — use `PATCH /users/:id` with `{ isActive: false }`. The UI should show a toggle or "Desactivar" button instead of a delete icon.

### 8.3 Categories deletion constraint
The backend blocks deletion of categories that have products. The UI must handle the `400 Bad Request` error gracefully — show a toast with the server error message.

### 8.4 Existing `useCategories` hook is read-only
The existing `useCategories.ts` at `hooks/useCategories.ts` only has `useQuery`. It must be **extended with mutations** — do NOT create a separate file. Keep all category hooks in one file.

### 8.5 No shared types for DTOs
`CreateUserDto`, `UpdateUserDto`, `CreateCategoryDto`, `UpdateCategoryDto` exist only as NestJS DTOs in `apps/api`. The shared package at `packages/shared` has `User` and `Category` interfaces but no DTO types. These must be defined locally in the service files (or added to shared).

### 8.6 `max_discount_percent` will be a string
Settings values are always strings in the API (`Record<string, string>`). The "max_discount_percent" field must be: (1) stored as string, (2) converted to number for validation, (3) converted back to string on save.

### 8.7 Card + paper-panel patterns
Use `Card` + `CardHeader` + `CardContent` for section wrapping. For non-card containers, `paper-panel` class is available: `border border-border/80 bg-surface/90 shadow-papyrus backdrop-blur rounded-2xl`.

---

## 9. Summary of Tasks Needed

| # | Task | Type |
|---|---|---|
| 1 | Create `services/settings.ts` | New file |
| 2 | Create `services/users.ts` | New file |
| 3 | Create `services/categories.ts` | New file |
| 4 | Create `hooks/useSettings.ts` | New file |
| 5 | Create `hooks/useUsers.ts` | New file |
| 6 | Extend `hooks/useCategories.ts` with mutations | Modify file |
| 7 | Create `components/settings/BusinessDataForm.tsx` | New file |
| 8 | Create `components/settings/PosParametersForm.tsx` | New file |
| 9 | Create `components/settings/UserTable.tsx` | New file |
| 10 | Create `components/settings/UserForm.tsx` | New file |
| 11 | Create `components/settings/CategoryTable.tsx` | New file |
| 12 | Create `components/settings/CategoryForm.tsx` | New file |
| 13 | Rewrite `pages/SettingsPage.tsx` | Modify file |
| 14 | Add DTO types to `@papyrus/shared` (optional) | Optional |
