/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        midnight: 'var(--bg-primary)',
        'midnight-deep': 'var(--bg-deep)',
        'midnight-soft': 'var(--bg-soft)',
        ocean: {
          DEFAULT: 'var(--ocean)',
          deep: 'var(--ocean)',
          light: 'var(--ocean-light)',
          glow: 'var(--ocean-light)',
        },
        emerald: {
          DEFAULT: 'var(--emerald)',
          deep: 'var(--emerald-deep)',
          light: 'var(--emerald)',
          glow: 'var(--emerald)',
        },
        mint: {
          DEFAULT: 'var(--text-primary)',
          soft: 'var(--text-primary)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'spin-slow': 'spin 80s linear infinite',
        'spin-slower': 'spin 120s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        aurora: 'aurora 12s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease forwards',
        'fade-up': 'fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        shimmer: 'shimmer 2.5s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        aurora: {
          '0%, 100%': { transform: 'translateX(-5%) rotate(0deg)', opacity: '0.3' },
          '50%': { transform: 'translateX(5%) rotate(2deg)', opacity: '0.5' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(57,217,138,0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(57,217,138,0.7)' },
        },
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, rgba(57,217,138,0.15), rgba(35,120,165,0.15), transparent)',
      },
    },
  },
  plugins: [],
};
