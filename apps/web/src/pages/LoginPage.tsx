import { type FormEvent, useState } from 'react';
import { AxiosError } from 'axios';
import { BookOpenCheck, KeyRound, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { AuthResponse } from '@papyrus/shared';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = {
      username: username.trim() ? undefined : 'Ingresá tu usuario.',
      password: password ? undefined : 'Ingresá tu contraseña.',
    };

    setErrors(nextErrors);

    if (nextErrors.username || nextErrors.password) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post<AuthResponse>('/auth/login', { username: username.trim(), password });
      login(response.data);
      toast.success('Bienvenido a Papyrus');
      navigate('/', { replace: true });
    } catch (error) {
      const message = error instanceof AxiosError && error.response?.status === 401
        ? 'Usuario o contraseña incorrectos.'
        : 'No pudimos iniciar sesión. Revisá la conexión con el servidor.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-10">
      <div className="absolute left-8 top-8 h-44 w-44 rounded-full bg-gold/20 blur-3xl" />
      <div className="absolute bottom-8 right-8 h-64 w-64 rounded-full bg-inverse/10 blur-3xl" />
      <section className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-border bg-surface/78 shadow-papyrus backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden min-h-[620px] flex-col justify-between bg-inverse p-10 text-white lg:flex">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 dark:bg-surface/20 bg-white/5 px-3 py-2 text-sm font-semibold text-gold-light">
              <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
              Papyrus Librería POS
            </div>
            <h1 className="mt-12 max-w-xl text-6xl font-bold leading-[0.95] text-white">
              Caja elegante para una librería con memoria.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-white/68">
              Un escritorio sereno para vender, cuidar stock y leer el negocio sin perder el carácter artesanal de la librería.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {['Ventas claras', 'Stock cuidado', 'Reportes listos'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 dark:border-white/5 dark:bg-surface/20 bg-white/5 p-4 text-white/72">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center p-6 sm:p-10">
          <Card className="w-full max-w-md border-gold/20 p-6 shadow-none sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">Acceso seguro</p>
            <h2 className="mt-3 text-4xl font-bold">Abrir caja</h2>
            <p className="mt-3 text-sm leading-6 text-primary/60">Ingresá con tu usuario para continuar al panel operativo.</p>
            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              <Input
                label="Usuario"
                autoComplete="username"
                placeholder="admin"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                error={errors.username}
              />
              <Input
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={errors.password}
              />
              <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
                {isSubmitting ? 'Validando...' : 'Entrar a Papyrus'}
              </Button>
            </form>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-bg p-4 text-sm text-primary/58">
              <KeyRound className="h-5 w-5 text-gold" aria-hidden="true" />
              <span>El token se guarda localmente para sostener la sesión del escritorio.</span>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary/38">
              <UserRound className="h-4 w-4" aria-hidden="true" />
              Librería Papyrus
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
