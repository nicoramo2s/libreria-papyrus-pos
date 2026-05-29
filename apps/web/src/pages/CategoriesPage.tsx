import { useState, useEffect } from 'react';
import { Tag, Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { CategoryTable } from '@/components/settings/CategoryTable';
import { CategoryFormModal } from '@/components/settings/CategoryFormModal';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useCategories';
import type { Category } from '@papyrus/shared';
import type { CreateCategoryDto, UpdateCategoryDto } from '@/services/categories';

export default function CategoriesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Debounce búsqueda por 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: categories, isLoading, error } = useCategories();

  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();

  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleCreate = () => {
    setFormMode('create');
    setSelectedCategory(null);
  };

  const handleEdit = (category: Category) => {
    setFormMode('edit');
    setSelectedCategory(category);
  };

  const handleDeleteClick = (category: Category) => {
    setDeleteCategoryId(category.id);
    setIsDeleting(true);
  };

  const handleConfirmDelete = () => {
    if (deleteCategoryId) {
      deleteCategory(deleteCategoryId, {
        onSuccess: () => {
          toast.success('Categoría eliminada correctamente');
          setIsDeleting(false);
          setDeleteCategoryId(null);
        },
        onError: (err) => {
          onMutationError(err);
          setIsDeleting(false);
          setDeleteCategoryId(null);
        },
      });
    }
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
    setDeleteCategoryId(null);
  };

  const handleFormSubmit = (data: CreateCategoryDto | UpdateCategoryDto) => {
    const onSuccess = () => {
      setFormMode(null);
      setSelectedCategory(null);
      toast.success(
        formMode === 'create'
          ? 'Categoría creada correctamente'
          : 'Categoría actualizada correctamente',
      );
    };

    if (formMode === 'create') {
      createCategory(data as CreateCategoryDto, { onSuccess, onError: onMutationError });
    } else if (formMode === 'edit' && selectedCategory) {
      updateCategory(
        { id: selectedCategory.id, data: data as UpdateCategoryDto },
        { onSuccess, onError: onMutationError },
      );
    }
  };

  const handleFormCancel = () => {
    setFormMode(null);
    setSelectedCategory(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-border bg-surface/60">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="text-sm text-primary/50">Cargando categorías…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="rounded-2xl border border-danger/20 bg-danger/5 p-6 text-center">
          <p className="text-sm font-semibold text-danger">Error al cargar categorías</p>
          <p className="mt-1 text-xs text-danger/60">Verificá la conexión con el servidor.</p>
        </div>
      </div>
    );
  }

  const allCategories = categories ?? [];

  const filteredCategories = search
    ? allCategories.filter((cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase()),
      )
    : allCategories;

  return (
    <div className="space-y-6">
      {/* Search & header bar */}
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40" />
          <Input
            placeholder="Buscar categoría por nombre…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-10 w-full max-w-sm pl-10 pr-10 text-sm"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                setSearch('');
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-surface/90 p-5 shadow-papyrus-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
              <Tag className="h-5 w-5 text-gold" />
            </div>
            <div>
              <Badge variant="gold">Categorías</Badge>
              <h2 className="mt-1 text-xl font-bold text-primary">Gestión de categorías</h2>
            </div>
          </div>
          <Button variant="secondary" onClick={handleCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva categoría
          </Button>
        </div>
      </div>

      {/* Categories Table */}
      <CategoryTable
        categories={filteredCategories}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Empty states */}
      {filteredCategories.length === 0 && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/80 bg-surface/60 px-6 py-16 text-center">
          <Tag className="h-12 w-12 text-primary/20" />
          <div>
            <p className="text-lg font-semibold text-primary/55">
              {search ? 'Sin resultados' : 'No hay categorías todavía'}
            </p>
            <p className="mt-1 text-sm text-primary/40">
              {search
                ? `No se encontraron categorías que coincidan con “${search}”.`
                : 'Empezá agregando la primera categoría al sistema.'}
            </p>
          </div>
          {!search && (
            <Button variant="secondary" onClick={handleCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              Crear primera categoría
            </Button>
          )}
        </div>
      )}

      {/* Category Form Modal */}
      {formMode !== null && (
        <CategoryFormModal
          category={selectedCategory}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isPending={isCreating || isUpdating}
        />
      )}

      {/* Confirm Delete Modal */}
      {isDeleting && deleteCategoryId && (
        <ConfirmDeleteModal
          isOpen={isDeleting}
          onOpenChange={(open) => {
            if (!open) handleCancelDelete();
          }}
          title="Eliminar categoría"
          description="¿Estás seguro de que deseas eliminar esta categoría? No se podrá eliminar si tiene productos asociados."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
