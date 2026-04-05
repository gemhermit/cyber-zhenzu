/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'c-bg': '#0a0a0f',
        'c-panel': '#111118',
        'c-panel2': '#1a1a25',
        'c-red': '#e63946',
        'c-gold': '#f4a825',
        'c-cyan': '#00e5ff',
        'c-text': '#f0ece3',
        'c-muted': '#7a7570',
        'c-border': '#2a2a35',
      },
      fontFamily: {
        'zhu': ['"ZCOOL XiaoWei"', 'serif'],
        'mono': ['"Space Mono"', 'monospace'],
      },
      animation: {
        'flicker': 'flicker 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(0.98)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(230,57,70,0.4)' },
          '50%': { boxShadow: '0 0 50px rgba(230,57,70,0.9)' },
        },
      },
    },
  },
  plugins: [],
}
