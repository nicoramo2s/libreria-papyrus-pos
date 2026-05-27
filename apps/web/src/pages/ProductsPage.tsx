import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { useCategories } from '@/hooks/useCategories';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useUploadProductImage } from '@/hooks/useProducts';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductForm } from '@/components/products/ProductForm';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { Toaster, toast } from 'sonner';
import { Plus, ChevronLeft, ChevronRight, X, BookOpen } from 'lucide-react';
import axios from 'axios';

export default function ProductsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [lowStock, setLowStock] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Debounce search por 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const { data: categories } = useCategories();

  const { data: response, isLoading, error } = useProducts({
    search,
    categoryId,
    lowStock,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const products = response?.data ?? [];
  const totalProducts = response?.total ?? 0;
  const totalPages = response?.totalPages ?? 1;

  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutate: deleteProduct, isPending: isDeletingMutation } = useDeleteProduct();
  const { mutate: uploadImage, isPending: isUploading } = useUploadProductImage();

  const onMutationError = (error: unknown) => {
    let message = 'Ocurrió un error inesperado';
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      const msg = error.response.data.message;
      message = Array.isArray(msg) ? msg.join(', ') : String(msg);
    } else if (error instanceof Error) {
      message = error.message;
    }
    toast.error(message);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value === 'all' ? undefined : value);
    setPage(1);
  };

  const handleLowStockChange = (checked: boolean) => {
    setLowStock(checked);
    setPage(1);
  };

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleCreateProduct = () => {
    setFormMode('create');
    setSelectedProductId(null);
  };

  const handleEditProduct = (id: string) => {
    setFormMode('edit');
    setSelectedProductId(id);
  };

  const handleDeleteProduct = (id: string) => {
    setDeleteProductId(id);
    setIsDeleting(true);
  };

  const handleConfirmDelete = () => {
    if (deleteProductId) {
      deleteProduct(deleteProductId, {
        onError: onMutationError,
      });
      setIsDeleting(false);
      setDeleteProductId(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
    setDeleteProductId(null);
  };

  const handleFormSubmit = async (data: any) => {
    const onSuccess = () => {
      setFormMode(null);
      setSelectedProductId(null);
    };
    if (formMode === 'create') {
      createProduct(data, { onSuccess, onError: onMutationError });
    } else if (formMode === 'edit' && selectedProductId) {
      updateProduct({ id: selectedProductId, data }, { onSuccess, onError: onMutationError });
    }
  };

  const handleFormCancel = () => {
    setFormMode(null);
    setSelectedProductId(null);
  };

  const handleImageUpload = async (productId: string, file: File) => {
    uploadImage({ productId, file });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Table skeleton */}
        <div className="flex h-96 items-center justify-center rounded-2xl border border-border bg-surface/60">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            <p className="text-sm text-primary/50">Cargando productos…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="rounded-2xl border border-danger/20 bg-danger/5 p-6 text-center">
          <p className="text-sm font-semibold text-danger">Error al cargar productos</p>
          <p className="mt-1 text-xs text-danger/60">Verificá la conexión con el servidor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <section className="rounded-2xl border border-border/80 bg-surface/90 px-4 py-3 shadow-papyrus-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[160px] flex-1">
            <Input
              placeholder="Buscar nombre, ISBN…"
              value={searchInput}
              onChange={handleSearch}
              className="h-9 w-full text-xs"
            />
          </div>

          <Select
            value={categoryId ?? 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="h-9 w-36 text-xs">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(value) => {
              const [field, order] = value.split('-');
              handleSortChange(field, order as 'asc' | 'desc');
            }}
          >
            <SelectTrigger className="h-9 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Fecha (nuevos)</SelectItem>
              <SelectItem value="createdAt-asc">Fecha (antiguos)</SelectItem>
              <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
              <SelectItem value="salePrice-asc">Precio (menor)</SelectItem>
              <SelectItem value="salePrice-desc">Precio (mayor)</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={limit.toString()}
            onValueChange={(value) => handleLimitChange(parseInt(value))}
          >
            <SelectTrigger className="h-9 w-20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-primary/60 hover:text-primary">
            <Checkbox
              checked={lowStock}
              onCheckedChange={handleLowStockChange}
            />
            <span onClick={() => handleLowStockChange(!lowStock)}>
              Solo stock bajo
            </span>
          </div>

          <Button variant="secondary" size="sm" onClick={handleCreateProduct} className="h-9 text-xs">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Nuevo
          </Button>
        </div>
      </section>

      {/* Products Table */}
      <ProductTable
        products={products}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onImageUpload={handleImageUpload}
        isLoading={isCreating || isUpdating || isDeletingMutation || isUploading}
      />

      {/* Pagination */}
      {products.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-surface/90 px-5 py-3 shadow-papyrus-sm">
          <p className="text-sm text-primary/50">
            <span className="font-semibold text-primary">{totalProducts}</span>{' '}
            producto{totalProducts !== 1 ? 's' : ''} en total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition ${
                      isActive
                        ? 'bg-primary text-white shadow-papyrus-sm'
                        : 'text-primary/55 hover:bg-gold/10 hover:text-primary'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <span className="px-1 text-sm text-primary/35">…</span>
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {products.length === 0 && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/80 bg-surface/60 px-6 py-16 text-center">
          <BookOpen className="h-12 w-12 text-primary/20" />
          <div>
            <p className="text-lg font-semibold text-primary/55">
              No se encontraron productos
            </p>
            <p className="mt-1 text-sm text-primary/40">
              {search || categoryId || lowStock
                ? 'Probá con otros filtros de búsqueda.'
                : 'Empezá agregando el primer título al catálogo.'}
            </p>
          </div>
          {!search && !categoryId && !lowStock && (
            <Button variant="secondary" onClick={handleCreateProduct}>
              <Plus className="mr-1.5 h-4 w-4" />
              Crear primer producto
            </Button>
          )}
        </div>
      )}

      {/* Product Form Modal */}
      {formMode !== null && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 pt-10 pb-10 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleFormCancel();
          }}
        >
          <div className="w-full max-w-xl animate-in slide-in-from-bottom-4 fade-in rounded-xl border border-border/80 bg-surface p-4 shadow-papyrus-lg duration-200 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="gold">{formMode === 'create' ? 'Nuevo' : 'Editar'}</Badge>
                <h2 className="text-lg font-bold text-primary">
                  {formMode === 'create' ? 'Agregar producto' : 'Editar producto'}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFormCancel}
                aria-label="Cerrar"
                className="hover:text-danger"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ProductForm
              productId={selectedProductId}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isCreating={isCreating}
              isUpdating={isUpdating}
              isUploading={isUploading}
            />
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {isDeleting && deleteProductId && (
        <ConfirmDeleteModal
          isOpen={isDeleting}
          onOpenChange={(open) => {
            if (!open) handleCancelDelete();
          }}
          title="Eliminar producto"
          description="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      <Toaster />
    </div>
  );
}
