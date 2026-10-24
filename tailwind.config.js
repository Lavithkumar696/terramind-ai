/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#061A1B',
        'midnight-deep': '#04141A',
        'midnight-soft': '#0A2730',
        ocean: {
          DEFAULT: '#2378A5',
          deep: '#1A5478',
          light: '#4FA8D8',
          glow: '#6FC4E8',
        },
        emerald: {
          DEFAULT: '#39D98A',
          deep: '#1FA868',
          light: '#5FEBA0',
          glow: '#7DF5B8',
        },
        mint: {
          DEFAULT: '#B8F3D0',
          soft: '#D6FBE5',
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
