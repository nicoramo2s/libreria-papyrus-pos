import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('papyrus-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useThemeStore = create<ThemeStore>((set) => {
  const initial = getInitialTheme();
  if (initial === 'dark') {
    document.documentElement.classList.add('dark');
  }

  return {
    theme: initial,
    toggleTheme: () =>
      set((state) => {
        const next = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('papyrus-theme', next);
        if (next === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { theme: next };
      }),
    setTheme: (theme: Theme) => {
      localStorage.setItem('papyrus-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      set({ theme });
    },
  };
});
