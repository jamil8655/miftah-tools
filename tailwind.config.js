/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7fb',
          100: '#e1eef7',
          200: '#b8dcee',
          300: '#75bfe0',
          400: '#2ea1d0',
          500: '#0B79B7', // Primary brand color
          600: '#0B79B7',
          700: '#075B8C', // Deep brand blue
          800: '#094d75',
          900: '#0c4162',
          950: '#072a41',
        },
        miftah: {
          primary: '#0B79B7',
          deep: '#075B8C',
          charcoal: '#1F2422',
          warmwhite: '#FAFBFC',
          softbg: '#F5F7F9',
          border: '#E1E7EC',
          text: '#182230',
          secondary: '#687587',
          gold: '#C8A96B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        arabic: ['"Noto Sans Arabic"', '"Segoe UI"', 'Tahoma', 'sans-serif'],
        devanagari: ['"Noto Sans Devanagari"', '"Mangal"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
