import { useState } from 'react';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { BusinessDataForm } from '@/components/settings/BusinessDataForm';
import { PosParamsForm } from '@/components/settings/PosParamsForm';
import { UserTable } from '@/components/settings/UserTable';
import { UserFormModal } from '@/components/settings/UserFormModal';
import { CategoryTable } from '@/components/settings/CategoryTable';
import { CategoryFormModal } from '@/components/settings/CategoryFormModal';
import { useSettingsQuery } from '@/hooks/useSettings';
import { useUsers, useCreateUser, useUpdateUser } from '@/hooks/useUsers';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import type { User } from '@papyrus/shared';
import type { Category } from '@papyrus/shared';
import type { CreateUserDto, UpdateUserDto } from '@/services/users';
import type { CreateCategoryDto, UpdateCategoryDto } from '@/services/categories';

export default function SettingsPage() {
  // Queries
  const { data: settings, isLoading: settingsLoading } = useSettingsQuery();
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // Mutations
  const { mutate: updateUser, isPending: isUpdatingUser } = useUpdateUser();
  const { mutate: createUser, isPending: isCreatingUser } = useCreateUser();
  const { mutate: createCategory, isPending: isCreatingCategory } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdatingCategory } = useUpdateCategory();
  const { mutate: deleteCategory, isPending: isDeletingCategory } = useDeleteCategory();

  // User modal state
  const [userFormMode, setUserFormMode] = useState<'create' | 'edit' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Category modal state
  const [categoryFormMode, setCategoryFormMode] = useState<'create' | 'edit' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Delete confirmation state
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Settings defaults
  const settingsDefaults = {
    business_name: settings?.business_name ?? '',
    business_address: settings?.business_address ?? '',
    business_phone: settings?.business_phone ?? '',
    ticket_message: settings?.ticket_message ?? '',
    max_discount_percent: settings?.max_discount_percent
      ? Number(settings.max_discount_percent)
      : 0,
    ticket_prefix: settings?.ticket_prefix ?? '',
  };

  // -- User handlers --
  const handleCreateUser = () => {
    setUserFormMode('create');
    setSelectedUser(null);
  };

  const handleEditUser = (user: User) => {
    setUserFormMode('edit');
    setSelectedUser(user);
  };

  const handleUserFormSubmit = (data: CreateUserDto | UpdateUserDto) => {
    if (userFormMode === 'create') {
      createUser(data as CreateUserDto, {
        onSuccess: () => {
          toast.success('Usuario creado correctamente');
          setUserFormMode(null);
          setSelectedUser(null);
        },
        onError: () => {
          toast.error('Error al crear el usuario');
        },
      });
    } else if (userFormMode === 'edit' && selectedUser) {
      updateUser(
        { id: selectedUser.id, data: data as UpdateUserDto },
        {
          onSuccess: () => {
            toast.success('Usuario actualizado correctamente');
            setUserFormMode(null);
            setSelectedUser(null);
          },
          onError: () => {
            toast.error('Error al actualizar el usuario');
          },
        },
      );
    }
  };

  const handleUserFormCancel = () => {
    setUserFormMode(null);
    setSelectedUser(null);
  };

  const handleToggleActive = (user: User) => {
    updateUser(
      { id: user.id, data: { isActive: !user.isActive } },
      {
        onSuccess: () => {
          toast.success(
            user.isActive
              ? 'Usuario desactivado correctamente'
              : 'Usuario activado correctamente',
          );
        },
        onError: () => {
          toast.error('Error al cambiar estado del usuario');
        },
      },
    );
  };

  // -- Category handlers --
  const handleCreateCategory = () => {
    setCategoryFormMode('create');
    setSelectedCategory(null);
  };

  const handleEditCategory = (category: Category) => {
    setCategoryFormMode('edit');
    setSelectedCategory(category);
  };

  const handleCategoryFormSubmit = (data: CreateCategoryDto | UpdateCategoryDto) => {
    if (categoryFormMode === 'create') {
      createCategory(data as CreateCategoryDto, {
        onSuccess: () => {
          toast.success('Categoría creada correctamente');
          setCategoryFormMode(null);
          setSelectedCategory(null);
        },
        onError: () => {
          toast.error('Error al crear la categoría');
        },
      });
    } else if (categoryFormMode === 'edit' && selectedCategory) {
      updateCategory(
        { id: selectedCategory.id, data: data as UpdateCategoryDto },
        {
          onSuccess: () => {
            toast.success('Categoría actualizada correctamente');
            setCategoryFormMode(null);
            setSelectedCategory(null);
          },
          onError: () => {
            toast.error('Error al actualizar la categoría');
          },
        },
      );
    }
  };

  const handleCategoryFormCancel = () => {
    setCategoryFormMode(null);
    setSelectedCategory(null);
  };

  const handleDeleteCategoryClick = (category: Category) => {
    setDeleteCategoryId(category.id);
    setIsDeleting(true);
  };

  const handleConfirmDeleteCategory = () => {
    if (deleteCategoryId) {
      deleteCategory(deleteCategoryId, {
        onSuccess: () => {
          toast.success('Categoría eliminada correctamente');
          setIsDeleting(false);
          setDeleteCategoryId(null);
        },
        onError: () => {
          toast.error('Error al eliminar la categoría');
          setIsDeleting(false);
          setDeleteCategoryId(null);
        },
      });
    }
  };

  const handleCancelDeleteCategory = () => {
    setIsDeleting(false);
    setDeleteCategoryId(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
          <Settings className="h-5 w-5 text-gold" />
        </div>
        <div>
          <Badge variant="gold">Ajustes</Badge>
          <h1 className="text-2xl font-bold text-primary mt-1">Configuración del sistema</h1>
        </div>
      </div>

      {/* Section 1: Business Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gold">Datos del negocio</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessDataForm
            defaultValues={settingsDefaults}
            isLoading={settingsLoading}
          />
        </CardContent>
      </Card>

      {/* Section 2: POS Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gold">Parámetros del Punto de Venta</CardTitle>
        </CardHeader>
        <CardContent>
          <PosParamsForm
            defaultValues={settingsDefaults}
            isLoading={settingsLoading}
          />
        </CardContent>
      </Card>

      {/* Section 3: User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gold">Usuarios</CardTitle>
            <button
              onClick={handleCreateUser}
              className="text-sm font-semibold text-gold hover:text-gold-light transition-colors"
            >
              + Nuevo usuario
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="space-y-3">
              <div className="h-10 w-full animate-pulse rounded-xl bg-border/50" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-border/50" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-border/50" />
            </div>
          ) : (
            <UserTable
              users={users || []}
              onEdit={handleEditUser}
              onToggleActive={handleToggleActive}
              isPending={isUpdatingUser}
            />
          )}
        </CardContent>
      </Card>

      {/* Section 4: Category Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gold">Categorías</CardTitle>
            <button
              onClick={handleCreateCategory}
              className="text-sm font-semibold text-gold hover:text-gold-light transition-colors"
            >
              + Nueva categoría
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="space-y-3">
              <div className="h-10 w-full animate-pulse rounded-xl bg-border/50" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-border/50" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-border/50" />
            </div>
          ) : (
            <CategoryTable
              categories={categories || []}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategoryClick}
            />
          )}
        </CardContent>
      </Card>

      {/* User Form Modal */}
      {userFormMode && (
        <UserFormModal
          user={selectedUser}
          onSubmit={handleUserFormSubmit}
          onCancel={handleUserFormCancel}
          isPending={isCreatingUser || isUpdatingUser}
        />
      )}

      {/* Category Form Modal */}
      {categoryFormMode && (
        <CategoryFormModal
          category={selectedCategory}
          onSubmit={handleCategoryFormSubmit}
          onCancel={handleCategoryFormCancel}
          isPending={isCreatingCategory || isUpdatingCategory}
        />
      )}

      {/* Confirm Delete Category Modal */}
      {isDeleting && deleteCategoryId && (
        <ConfirmDeleteModal
          isOpen={isDeleting}
          onOpenChange={(open) => {
            if (!open) handleCancelDeleteCategory();
          }}
          title="Eliminar categoría"
          description="¿Estás seguro de que deseas eliminar esta categoría? Los productos asociados podrían quedar sin categoría."
          onConfirm={handleConfirmDeleteCategory}
          onCancel={handleCancelDeleteCategory}
        />
      )}
    </div>
  );
}
