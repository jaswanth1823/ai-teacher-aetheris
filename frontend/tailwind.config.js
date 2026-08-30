/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0d14",
        card: "#111726",
        chalkboard: "#0b1320",
        neonCyan: "#00f0ff",
        neonPurple: "#a855f7",
        neonGreen: "#10b981",
        neonAmber: "#f59e0b",
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'sound-wave': 'soundWave 1.2s infinite ease-in-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 240, 255, 0.8)' },
        },
        soundWave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '28px' },
        }
      }
    },
  },
  plugins: [],
};
