import { BarChart3, BookOpen, LayoutDashboard, LogOut, ReceiptText, Settings, ShoppingCart, Sparkles, Tag } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, end: true },
  { name: 'Punto de venta', href: '/pos', icon: ShoppingCart },
  { name: 'Catálogo', href: '/products', icon: BookOpen },
  { name: 'Ventas', href: '/sales', icon: ReceiptText },
  { name: 'Servicios', href: '/services', icon: Sparkles },
  { name: 'Categorías', href: '/categories', icon: Tag },
  { name: 'Reportes', href: '/reports', icon: BarChart3 },
];

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-border bg-surface/88 px-4 py-5 shadow-papyrus-sm backdrop-blur lg:flex lg:flex-col">
      <div className="mb-8 rounded-2xl border border-gold/25 bg-gold/10 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">Papyrus</p>
        <h1 className="mt-1 text-2xl font-bold">Librería POS</h1>
        <p className="mt-2 text-sm leading-6 text-primary/58">Caja, inventario y criterio editorial en un solo escritorio.</p>
      </div>
      <nav className="space-y-1.5" aria-label="Navegación principal">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'focus-ring group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-primary/68',
                'hover:bg-gold/10 hover:text-primary',
                isActive && 'bg-primary text-white shadow-papyrus-sm hover:bg-primary hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('h-5 w-5', isActive ? 'text-gold-light' : 'text-gold')} aria-hidden="true" />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-border bg-bg/70 p-4 text-sm">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/20 text-sm font-semibold text-gold">
              {(user.displayName || user.username).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-primary">{user.displayName || user.username}</p>
              <p className="truncate text-primary/58">@{user.username}</p>
            </div>
            <div className="flex items-center gap-1">
              <NavLink
                to="/settings"
                className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-primary/48 hover:bg-gold/10 hover:text-primary"
                title="Ajustes"
              >
                <Settings className="h-4 w-4" />
              </NavLink>
              <button
                onClick={logout}
                className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-primary/48 hover:bg-red-50 hover:text-red-600"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <p className="text-primary/58">Sesión no iniciada</p>
        )}
      </div>
    </aside>
  );
}
