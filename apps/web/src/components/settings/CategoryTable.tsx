import { Button } from '@/components/ui/Button';
import { Edit, Trash2, Tag } from 'lucide-react';
import type { Category } from '@papyrus/shared';

interface CategoryWithCount extends Category {
  _count?: {
    products: number;
  };
}

interface CategoryTableProps {
  categories: CategoryWithCount[];
  onEdit: (category: CategoryWithCount) => void;
  onDelete: (category: CategoryWithCount) => void;
}

export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  if (categories.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-primary/55">
        <div className="text-center">
          <Tag className="mx-auto h-8 w-8 mb-2 text-primary/35" />
          <p>No hay categorías</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left rtl:text-right text-primary">
        <thead className="text-xs uppercase text-primary bg-primary/[0.04]">
          <tr>
            <th scope="col" className="px-6 py-3">Nombre</th>
            <th scope="col" className="px-6 py-3">Icono</th>
            <th scope="col" className="px-6 py-3">Color</th>
            <th scope="col" className="px-6 py-3">Productos</th>
            <th scope="col" className="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="border-b border-border bg-surface hover:bg-primary/[0.02]">
              <td className="px-6 py-4 font-medium text-primary">{category.name}</td>
              <td className="px-6 py-4 text-primary/75">{category.icon || '—'}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div
                    className="h-5 w-5 rounded-full border border-border"
                    style={{ backgroundColor: category.color ?? '#B8922A' }}
                  />
                  <span className="text-xs text-primary/55 font-mono">
                    {category.color || '#B8922A'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-primary/75">
                {category._count?.products ?? 0}
              </td>
              <td className="px-6 py-4 space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit(category)}
                  aria-label="Editar categoría"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(category)}
                  aria-label="Eliminar categoría"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
