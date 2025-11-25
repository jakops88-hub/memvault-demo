/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // En anpassad mörk palett för SaaS-känslan
        background: '#09090b', // Zinc-950
        surface: '#18181b',    // Zinc-900
        border: '#27272a',     // Zinc-800
        primary: '#3b82f6',    // Blue-500
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}