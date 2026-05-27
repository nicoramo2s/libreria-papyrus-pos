import { useRef, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { productsService } from "@/services/products";
import { useCategories } from "@/hooks/useCategories";
import { Loader2, Upload, X } from "lucide-react";
import type { CreateProductDto, UpdateProductDto } from "@papyrus/shared";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

const productFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  isbn: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{10,13}$/.test(val),
      "ISBN debe tener entre 10 y 13 dígitos",
    ),

  purchasePrice: z.coerce
    .number()
    .positive("El precio de compra debe ser mayor a 0"),
  salePrice: z.coerce
    .number()
    .positive("El precio de venta debe ser mayor a 0"),
  stock: z.coerce
    .number()
    .int("Debe ser un número entero")
    .nonnegative("El stock no puede ser negativo"),
  stockAlert: z.coerce.number().int().nonnegative().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  productId: string | null;
  onSubmit: (data: CreateProductDto | UpdateProductDto) => void;
  onCancel: () => void;
  isCreating?: boolean;
  isUpdating?: boolean;
  isUploading?: boolean;
}

export function ProductForm({
  productId,
  onSubmit,
  onCancel,
  isCreating = false,
  isUpdating = false,
  isUploading = false,
}: ProductFormProps) {
  const isEdit = productId !== null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const {
    data: product,
    isLoading: isLoadingProduct,
    isError: isErrorProduct,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productsService.getProductById(productId!),
    enabled: isEdit,
  });

  const { data: categories } = useCategories();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: undefined,
      isbn: "",

      purchasePrice: 0,
      salePrice: 0,
      stock: 0,
      stockAlert: 0,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        description: product.description || "",
        categoryId: product.categoryId || undefined,
        isbn: product.isbn || "",

        purchasePrice: product.purchasePrice || 0,
        salePrice: product.salePrice || 0,
        stock: product.stock || 0,
        stockAlert: product.stockAlert || 0,
      });
      if (product.imageUrl) {
        setExistingImageUrl(product.imageUrl);
      }
    }
  }, [product, form.reset]);

  const validateImage = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Solo se permiten imágenes JPG, PNG o WEBP";
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return "La imagen no debe superar los 2MB";
    }
    return null;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImage(file);
    if (error) {
      setImageError(error);
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setImageError(null);
    setImageFile(file);
    setExistingImageUrl(null);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = form.handleSubmit((values) => {
    if (isEdit) {
      const updateData: Record<string, unknown> = { ...values };

      // If the product originally had a category and the user cleared it,
      // explicitly send null so Prisma removes the FK association
      if (product?.categoryId && !values.categoryId) {
        updateData.categoryId = null;
      }

      // Don't include `id` in the body — backend @forbidNonWhitelisted rejects it
      onSubmit(updateData as unknown as UpdateProductDto);
    } else {
      onSubmit(values as unknown as CreateProductDto);
    }
  });

  const isLoadingForm = isEdit && isLoadingProduct;
  const isSaving = isCreating || isUpdating;

  if (isLoadingForm) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-gold" />
      </div>
    );
  }

  if (isEdit && isErrorProduct) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
        <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3">
          <p className="text-sm font-semibold text-danger">
            Error al cargar el producto
          </p>
          <p className="mt-0.5 text-xs text-danger/60">
            Verificá la conexión e intentá de nuevo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Fila superior: datos principales */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Input
            label="Nombre *"
            placeholder="Nombre del producto"
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />
        </div>
        <Input
          label="ISBN"
          placeholder="ISBN (10-13 dígitos)"
          error={form.formState.errors.isbn?.message}
          {...form.register("isbn")}
        />
        <Controller
          name="categoryId"
          control={form.control}
          render={({ field }) => (
            <div>
              <label className="mb-3 mt-1 block text-xs font-bold uppercase tracking-[0.08em] text-primary">
                Categoría
              </label>
              <Select
                value={field.value ?? "none"}
                onValueChange={(val) =>
                  field.onChange(val === "none" ? undefined : val)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin categoría</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />
      </div>

      {/* Descripción */}
      <Textarea
        label="Descripción"
        placeholder="Descripción del producto"
        error={form.formState.errors.description?.message}
        {...form.register("description")}
      />

      {/* Fila: precios + stock */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Input
          label="Compra *"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          error={form.formState.errors.purchasePrice?.message}
          {...form.register("purchasePrice")}
        />
        <Input
          label="Venta *"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          error={form.formState.errors.salePrice?.message}
          {...form.register("salePrice")}
        />
        <Input
          label="Stock *"
          type="number"
          min="0"
          placeholder="0"
          error={form.formState.errors.stock?.message}
          {...form.register("stock")}
        />
        <Input
          label="Alerta"
          type="number"
          min="0"
          placeholder="0"
          error={form.formState.errors.stockAlert?.message}
          {...form.register("stockAlert")}
        />
      </div>

      {/* Imagen compacta */}
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-[0.08em] text-primary/50">
          Imagen
        </label>
        {imagePreview || existingImageUrl ? (
          <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-bg/40 px-3 py-2">
            <img
              src={imagePreview ?? existingImageUrl!}
              alt="Vista previa"
              className="h-10 w-10 shrink-0 rounded-md border border-border object-cover"
            />
            <span className="flex-1 truncate text-xs text-primary/55">
              {imageFile ? imageFile.name : "Imagen actual"}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveImage}
              aria-label="Eliminar imagen"
              className="-mr-1 h-7 w-7"
            >
              <X className="h-3.5 w-3.5 text-danger" />
            </Button>
          </div>
        ) : (
          <div
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border/70 bg-bg/30 px-3 py-2 text-xs text-primary/50 transition-colors hover:border-gold/50 hover:text-gold"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Upload className="h-3.5 w-3.5 shrink-0" />
            <span>Agregar imagen (2MB máx. — JPG, PNG, WEBP)</span>
          </div>
        )}
        {imageError && (
          <p className="mt-1 text-xs font-medium text-danger">{imageError}</p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={form.formState.isSubmitting || isSaving}
          isLoading={form.formState.isSubmitting || isSaving}
        >
          {isEdit ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
