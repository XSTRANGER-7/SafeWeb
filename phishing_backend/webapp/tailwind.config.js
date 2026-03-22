/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0f1e',
          neon: '#00e0ff',
          accent: '#7a5cff',
          danger: '#ff3864',
          success: '#00ffa3',
        }
      }
    },
  },
  plugins: [],
}


