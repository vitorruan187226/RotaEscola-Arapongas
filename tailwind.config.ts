import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta GovTech Premium — RotaEscola Arapongas
        primary: {
          DEFAULT: '#0F172A', // Azul Marinho Profundo — segurança institucional
          50:  '#f0f4ff',
          100: '#dce7ff',
          200: '#b9d0ff',
          300: '#84acff',
          400: '#487eff',
          500: '#1a52ff',
          600: '#0032f5',
          700: '#0027d8',
          800: '#0520ae',
          900: '#0a1f88',
          950: '#0F172A',
        },
        secondary: {
          DEFAULT: '#F8FAFC', // Cinza Gelo — leitura fácil
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        accent: {
          DEFAULT: '#FBBF24', // Amarelo Ônibus Escolar — ação principal
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Aliases semânticos para uso direto
        navy:    '#0F172A',
        'ice':   '#F8FAFC',
        'bus-yellow': '#FBBF24',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'pill': '9999px',
      },
      boxShadow: {
        'card':   '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
        'card-hover': '0 10px 15px -3px rgba(15,23,42,0.10), 0 4px 6px -2px rgba(15,23,42,0.05)',
        'nav':    '0 2px 8px rgba(15,23,42,0.15)',
        'glow-yellow': '0 0 24px rgba(251,191,36,0.30)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
