/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        school21: 'var(--color-school21)',
        school21dark: 'var(--color-school21dark)',
        school21purple: 'var(--color-school21purple)',
        darkBg: '#1D2633',
        textMain: '#212121',
        lightGray: '#C6CFDA',
        neonLogo: '#00FFAF',
      },
      fontFamily: {
        pixel: ['"PixelUni"', '"VT323"', 'monospace'],
      },
      boxShadow: {
        'pixel': '0.25rem 0.25rem 0 0 rgba(0, 0, 0, 1)',
        'pixel-sm': '0.125rem 0.125rem 0 0 rgba(0, 0, 0, 1)',
      }
    },
  },
  plugins: [],
}