import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: {
          DEFAULT: 'var(--surface)',
          raised: 'var(--surface-raised)',
          subtle: 'var(--surface-subtle)',
        },
        brand: {
          DEFAULT: '#10b981',
          hover: '#059669',
          soft: '#064e3b',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-brand': '0 0 24px rgba(16, 185, 129, 0.25)',
        'glow-brand-md': '0 0 36px rgba(16, 185, 129, 0.35), 0 0 12px rgba(16, 185, 129, 0.25)',
        'glow-brand-lg': '0 0 60px rgba(16, 185, 129, 0.45), 0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-danger': '0 0 24px rgba(239, 68, 68, 0.25)',
        'inner-highlight': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)', opacity: '0.6' },
          '33%': { transform: 'translate3d(4%, -3%, 0) scale(1.08)', opacity: '0.75' },
          '66%': { transform: 'translate3d(-3%, 2%, 0) scale(0.95)', opacity: '0.55' },
        },
        'aurora-slow': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)', opacity: '0.5' },
          '50%': { transform: 'translate3d(-5%, 4%, 0) scale(1.12)', opacity: '0.7' },
        },
        'grid-fade': {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.55' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 24px rgba(16, 185, 129, 0.25)' },
          '50%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.45)' },
        },
        'border-sheen': {
          '0%': { backgroundPosition: '200% 50%' },
          '100%': { backgroundPosition: '-200% 50%' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 200ms ease-out',
        aurora: 'aurora 18s ease-in-out infinite',
        'aurora-slow': 'aurora-slow 26s ease-in-out infinite',
        'grid-fade': 'grid-fade 8s ease-in-out infinite',
        shimmer: 'shimmer 2.4s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3.5s ease-in-out infinite',
        'border-sheen': 'border-sheen 6s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
