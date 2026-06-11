import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        gold: 'rgb(var(--color-gold) / <alpha-value>)',
        'gold-light': 'rgb(var(--color-gold-light) / <alpha-value>)',
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        inverse: 'rgb(var(--color-inverse) / <alpha-value>)',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        papyrus: 'var(--shadow-papyrus)',
        'papyrus-sm': 'var(--shadow-papyrus-sm)',
        'papyrus-lg': 'var(--shadow-papyrus-lg)',
      },
      backgroundImage: {
        'paper-grain':
          'radial-gradient(circle at 1px 1px, rgba(184, 146, 42, 0.08) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};

export default config;
