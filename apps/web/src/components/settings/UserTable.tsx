import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Edit, UserRound } from 'lucide-react';
import type { User } from '@papyrus/shared';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onToggleActive: (user: User) => void;
  isPending?: boolean;
}

export function UserTable({ users, onEdit, onToggleActive, isPending = false }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-primary/55">
        <div className="text-center">
          <UserRound className="mx-auto h-8 w-8 mb-2 text-primary/35" />
          <p>No hay usuarios registrados</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left rtl:text-right text-primary">
        <thead className="text-xs uppercase text-primary bg-inverse/[0.04]">
          <tr>
            <th scope="col" className="px-6 py-3">Usuario</th>
            <th scope="col" className="px-6 py-3">Nombre</th>
            <th scope="col" className="px-6 py-3">Estado</th>
            <th scope="col" className="px-6 py-3">Último ingreso</th>
            <th scope="col" className="px-6 py-3">Creado</th>
            <th scope="col" className="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border bg-surface hover:bg-inverse/[0.02]">
              <td className="px-6 py-4 font-medium text-primary">{user.username}</td>
              <td className="px-6 py-4 text-primary/75">{user.displayName}</td>
              <td className="px-6 py-4">
                <Badge variant={user.isActive ? 'success' : 'danger'}>
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </td>
              <td className="px-6 py-4 text-primary/55">
                {user.lastLogin ? formatDate(user.lastLogin) : '—'}
              </td>
              <td className="px-6 py-4 text-primary/55">
                {formatDate(user.createdAt)}
              </td>
              <td className="px-6 py-4 space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit(user)}
                  aria-label="Editar usuario"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant={user.isActive ? 'danger' : 'secondary'}
                  size="sm"
                  onClick={() => onToggleActive(user)}
                  isLoading={isPending}
                  aria-label={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                >
                  {user.isActive ? 'Desactivar' : 'Activar'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
