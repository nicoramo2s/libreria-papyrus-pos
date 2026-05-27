# Design: frontend-products-crud

## Technical Approach

Implement a complete CRUD UI for product management following the existing codebase patterns and the PRD specifications. The approach leverages React Query for data fetching and mutations, React Hook Form with Zod for form validation, and follows the existing component structure in `apps/web/src/components`. The design extends the existing `useProducts` hook and creates a dedicated products service for API interactions.

## Architecture Decisions

### Decision: State Management Approach

**Choice**: Use React Query for server state and React Hook Form for form state
**Alternatives considered**: Zustand for all state, Context API + useReducer
**Rationale**: React Query provides excellent caching, automatic refetching, and mutation handling that aligns perfectly with the CRUD operations. The existing codebase already uses React Query (via `@tanstack/react-query`), so maintaining consistency is preferred. React Hook Form is the standard for form validation in this codebase (evidenced by its use in other parts of the application).

### Decision: File Upload Implementation

**Choice**: Use native File API with drag & drop and preview, integrated with React Hook Form
**Alternatives considered**: Dedicated upload libraries (react-dropzone, react-filepond)
**Rationale**: The requirements are straightforward (drag & drop, preview, 2MB limit, JPG/PNG/WEBP). Native File API with React Hook Form integration provides sufficient functionality without adding external dependencies, keeping the bundle size minimal.

### Decision: Component Structure

**Choice**: Organize product-related components in `apps/web/src/components/products/` directory
**Alternatives considered**: Flat structure in components directory, grouping by feature type
**Rationale**: Following the existing pattern seen in `components/pos/` and `components/layout/`, grouping related components in a dedicated directory improves maintainability and makes the codebase easier to navigate as it grows.

### Decision: API Service Layer

**Choice**: Create dedicated `services/products.ts` for product-specific API calls
**Alternatives considered**: Extend existing `services/api.ts`, put API calls directly in components
**Rationale**: A dedicated service layer improves separation of concerns, makes API calls reusable across components, and follows the existing pattern of having domain-specific services. This approach also centralizes API endpoint knowledge.

## Data Flow

```
User Interface ──→ React Hook Form (form state)
        │                          │
        │                          ▼
        │                    Validation (Zod)
        │                          │
        ▼                          ▼
Products Page ←──── Products Service ←─── REST API (/products)
        ▲                          │
        │                          ▼
    React Query ←───── useProducts Hook ◄───── Products Service
        │                          │
        │                          ▼
        └─────── Table/Form Components ◄───── Product Data
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/web/src/pages/ProductsPage.tsx` | Create | Main page component orchestrating product list and form dialog |
| `apps/web/src/components/products/ProductTable.tsx` | Create | Table component with search, filters, sorting, pagination, and actions |
| `apps/web/src/components/products/ProductForm.tsx` | Create | Form component for create/edit with tabs, image upload, and validation |
| `apps/web/src/components/ui/StockBadge.tsx` | Create | Badge component showing stock level and alert status with color coding |
| `apps/web/src/components/ui/ConfirmDeleteModal.tsx` | Create | Reusable confirmation dialog for delete operations |
| `apps/web/src/hooks/useProducts.ts` | Modify | Extend with sorting, pagination, and additional filter parameters |
| `apps/web/src/services/products.ts` | Create | Service encapsulating product API endpoints |
| `apps/web/src/index.css` | Modify | Add styles for new components if needed (responsive table, form spacing) |

## Interfaces / Contracts

### Product Form Values Interface
```typescript
interface ProductFormValues {
  // Basic Info
  name: string;
  description?: string;
  categoryId: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  
  // Pricing
  purchasePrice: number;
  salePrice: number;
  
  // Inventory
  stock: number;
  stockAlert: number;
  
  // Image
  imageFile?: File | null;
  imageUrl?: string;
}
```

### Product Service Methods
```typescript
interface ProductService {
  getProducts(params: ProductSearchParams): Promise<ProductResponse>;
  getProductById(id: string): Promise<Product>;
  createProduct(data: ProductCreateDto): Promise<Product>;
  updateProduct(id: string, data: ProductUpdateDto): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  uploadProductImage(productId: string, file: File): Promise<Product>;
  deleteProductImage(productId: string): Promise<void>;
}
```

### Stock Badge Props
```typescript
interface StockBadgeProps {
  stock: number;
  stockAlert: number;
  size?: 'sm' | 'md' | 'lg';
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Form validation rules | Test with various valid/invalid inputs using Vitest |
| Unit | Stock badge color logic | Test boundary conditions (stock = alert, stock < alert, stock > alert) |
| Component | ProductTable filtering/sorting | Mock data and test UI updates when filters change |
| Component | ProductForm image upload | Mock File API and test state updates |
| Integration | Products page data flow | Test React Query integration with mock service |
| E2E | Complete CRUD flow | Cypress test for creating, editing, deleting product |

## Migration / Rollout

No migration required as this is a frontend-only feature that interacts with existing backend APIs.

## Open Questions

- [ ] Should the product form use a modal or inline expansion within the table?
- [ ] What should be the default page size for pagination?
- [ ] Should we implement client-side or server-side sorting/filtering?
- [ ] Need to confirm exact image upload endpoint format with backend team

## Next Step
Ready for tasks (sdd-tasks).