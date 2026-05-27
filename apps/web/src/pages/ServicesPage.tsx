import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks/useServices';
import { ServiceTable } from '@/components/services/ServiceTable';
import { ServiceForm } from '@/components/services/ServiceForm';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { Toaster, toast } from 'sonner';
import { Plus, Sparkles, X } from 'lucide-react';
import axios from 'axios';
import type { CreateServiceData, UpdateServiceData } from '@/services/services';

export default function ServicesPage() {
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);

  const { data: services, isLoading, error } = useServices();
  const { mutate: createService, isPending: isCreating } = useCreateService();
  const { mutate: updateService, isPending: isUpdating } = useUpdateService();
  const { mutate: deleteService, isPending: isDeletingMutation } = useDeleteService();

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
    setSelectedServiceId(null);
  };

  const handleEdit = (id: string) => {
    setFormMode('edit');
    setSelectedServiceId(id);
  };

  const handleDelete = (id: string) => {
    setDeleteServiceId(id);
    setIsDeleting(true);
  };

  const handleConfirmDelete = () => {
    if (deleteServiceId) {
      deleteService(deleteServiceId, {
        onSuccess: () => {
          toast.success('Servicio desactivado correctamente');
          setIsDeleting(false);
          setDeleteServiceId(null);
        },
        onError: onMutationError,
      });
    }
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
    setDeleteServiceId(null);
  };

  const handleFormSubmit = (data: CreateServiceData | UpdateServiceData) => {
    const onSuccess = () => {
      setFormMode(null);
      setSelectedServiceId(null);
      toast.success(formMode === 'create' ? 'Servicio creado correctamente' : 'Servicio actualizado correctamente');
    };

    if (formMode === 'create') {
      createService(data as CreateServiceData, { onSuccess, onError: onMutationError });
    } else if (formMode === 'edit' && selectedServiceId) {
      updateService({ id: selectedServiceId, data: data as UpdateServiceData }, { onSuccess, onError: onMutationError });
    }
  };

  const handleFormCancel = () => {
    setFormMode(null);
    setSelectedServiceId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex h-96 items-center justify-center rounded-2xl border border-border bg-surface/60">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            <p className="text-sm text-primary/50">Cargando servicios…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="rounded-2xl border border-danger/20 bg-danger/5 p-6 text-center">
          <p className="text-sm font-semibold text-danger">Error al cargar servicios</p>
          <p className="mt-1 text-xs text-danger/60">Verificá la conexión con el servidor.</p>
        </div>
      </div>
    );
  }

  const allServices = services ?? [];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-surface/90 p-5 shadow-papyrus-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
            <Sparkles className="h-5 w-5 text-gold" />
          </div>
          <div>
            <Badge variant="gold">Servicios</Badge>
            <h2 className="mt-1 text-xl font-bold text-primary">Gestión de servicios</h2>
          </div>
        </div>
        <Button variant="secondary" onClick={handleCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Nuevo servicio
        </Button>
      </div>

      {/* Services Table */}
      <ServiceTable
        services={allServices}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isCreating || isUpdating || isDeletingMutation}
      />

      {/* Empty state */}
      {allServices.length === 0 && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/80 bg-surface/60 px-6 py-16 text-center">
          <Sparkles className="h-12 w-12 text-primary/20" />
          <div>
            <p className="text-lg font-semibold text-primary/55">
              No hay servicios todavía
            </p>
            <p className="mt-1 text-sm text-primary/40">
              Empezá agregando el primer servicio al sistema.
            </p>
          </div>
          <Button variant="secondary" onClick={handleCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Crear primer servicio
          </Button>
        </div>
      )}

      {/* Service Form Modal */}
      {formMode !== null && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 pt-10 pb-10 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleFormCancel();
          }}
        >
          <div className="w-full max-w-lg animate-in slide-in-from-bottom-4 fade-in rounded-2xl border border-border/80 bg-surface p-6 shadow-papyrus-lg duration-200 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Badge variant="gold">{formMode === 'create' ? 'Nuevo' : 'Editar'}</Badge>
                <h2 className="mt-2 text-2xl font-bold text-primary">
                  {formMode === 'create' ? 'Agregar servicio' : 'Editar servicio'}
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
            <ServiceForm
              serviceId={selectedServiceId}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isSaving={isCreating || isUpdating}
            />
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {isDeleting && deleteServiceId && (
        <ConfirmDeleteModal
          isOpen={isDeleting}
          onOpenChange={(open) => {
            if (!open) handleCancelDelete();
          }}
          title="Desactivar servicio"
          description="¿Estás seguro de que deseas desactivar este servicio? Los tickets existentes no se verán afectados."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      <Toaster />
    </div>
  );
}
