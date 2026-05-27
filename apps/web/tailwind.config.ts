import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1A1A1A',
        gold: '#B8922A',
        'gold-light': '#D9BE6C',
        bg: '#F5F0E8',
        surface: '#FFFFFF',
        border: '#E6DCCB',
        danger: '#B42318',
        success: '#2F6B3F',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        papyrus: '0 18px 50px rgba(26, 26, 26, 0.08)',
        'papyrus-sm': '0 10px 30px rgba(26, 26, 26, 0.06)',
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
