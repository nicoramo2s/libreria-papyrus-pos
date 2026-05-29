import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Trash2 } from "lucide-react";
import type { User } from "@papyrus/shared";

const createUserSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  displayName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  isActive: z.boolean().optional(),
});

const editUserSchema = z.object({
  displayName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  password: z.string().optional(),
  isActive: z.boolean(),
});

type CreateUserValues = z.infer<typeof createUserSchema>;
type EditUserValues = z.infer<typeof editUserSchema>;

interface UserFormModalProps {
  user: User | null;
  onSubmit: (data: CreateUserValues | EditUserValues) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function UserFormModal({
  user,
  onSubmit,
  onCancel,
  isPending,
}: UserFormModalProps) {
  const isEdit = user !== null;

  const createForm = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      displayName: "",
      password: "",
      isActive: true,
    },
  });

  const editForm = useForm<EditUserValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      displayName: "",
      password: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (user) {
      editForm.reset({
        displayName: user.displayName || "",
        password: "",
        isActive: user.isActive,
      });
    } else {
      createForm.reset({
        username: "",
        displayName: "",
        password: "",
        isActive: true,
      });
    }
  }, [user]);

  const handleSubmit = isEdit
    ? editForm.handleSubmit((data) => onSubmit(data))
    : createForm.handleSubmit((data) => onSubmit(data));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg p-6 mx-4">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-primary">
            {isEdit ? "Editar usuario" : "Nuevo usuario"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            aria-label="Cerrar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <Input
              label="Usuario *"
              placeholder="Nombre de usuario"
              error={createForm.formState.errors.username?.message}
              {...createForm.register("username")}
            />
          )}

          {isEdit ? (
            <Input
              label="Nombre completo *"
              placeholder="Nombre a mostrar"
              error={editForm.formState.errors.displayName?.message}
              {...editForm.register("displayName")}
            />
          ) : (
            <Input
              label="Nombre completo *"
              placeholder="Nombre a mostrar"
              error={createForm.formState.errors.displayName?.message}
              {...createForm.register("displayName")}
            />
          )}

          {isEdit ? (
            <Input
              label="Contraseña (dejar vacío para mantener)"
              type="password"
              placeholder="Nueva contraseña"
              error={editForm.formState.errors.password?.message}
              {...editForm.register("password")}
            />
          ) : (
            <Input
              label="Contraseña *"
              type="password"
              placeholder="Contraseña"
              error={createForm.formState.errors.password?.message}
              {...createForm.register("password")}
            />
          )}

          {isEdit && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={editForm.watch("isActive")}
                onCheckedChange={(checked) =>
                  editForm.setValue("isActive", checked === true)
                }
              />
              <label className="text-sm font-medium text-primary cursor-pointer">
                Usuario activo
              </label>
            </div>
          )}

          <div className="flex flex-col-reverse md:flex-row md:justify-end md:gap-3 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isPending} disabled={isPending}>
              {isEdit ? "Actualizar usuario" : "Crear usuario"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
