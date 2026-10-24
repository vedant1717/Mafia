/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mafia: {
          dark: '#0d0f17',
          card: '#161926',
          border: '#2a2f45',
          red: '#ff3b5c',
          redGlow: 'rgba(255, 59, 92, 0.4)',
          accent: '#7c3aed',
          cyan: '#06b6d4',
          gold: '#f59e0b',
          emerald: '#10b981'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-red': 'glowRed 2s infinite alternate',
      },
      keyframes: {
        glowRed: {
          '0%': { boxShadow: '0 0 10px rgba(255, 59, 92, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(255, 59, 92, 0.8)' }
        }
      }
    },
  },
  plugins: [],
}
