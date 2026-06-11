import { Menu, Moon, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';
import { cn } from '../../lib/utils';

const titles: Record<string, { eyebrow: string; title: string }> = {
  '/': { eyebrow: 'Resumen editorial', title: 'Dashboard' },
  '/pos': { eyebrow: 'Operación diaria', title: 'Punto de venta' },
  '/products': { eyebrow: 'Inventario vivo', title: 'Catálogo' },
  '/sales': { eyebrow: 'Historial comercial', title: 'Ventas' },
  '/categories': { eyebrow: 'Clasificación editorial', title: 'Categorías' },
  '/reports': { eyebrow: 'Lectura del negocio', title: 'Reportes' },
  '/settings': { eyebrow: 'Administración', title: 'Ajustes' },
};

export default function Header() {
  const location = useLocation();
  const title = titles[location.pathname] ?? titles['/'];
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-bg/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-gold">
            <Menu className="h-4 w-4 lg:hidden" aria-hidden="true" />
            {title.eyebrow}
          </div>
          <h2 className="mt-1 truncate text-2xl font-bold sm:text-3xl">{title.title}</h2>
        </div>
        <button
          onClick={toggleTheme}
          className={cn(
            'focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
            'text-primary/48 hover:bg-gold/10 hover:text-primary',
            'transition-colors duration-200',
          )}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );
}
