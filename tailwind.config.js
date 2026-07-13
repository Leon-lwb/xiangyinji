/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      colors: {
        cinema: {
          bg: 'hsl(25, 30%, 8%)',
          fg: 'hsl(40, 25%, 92%)',
          muted: 'hsl(35, 12%, 55%)',
          primary: 'hsl(42, 85%, 58%)',
          secondary: 'hsl(30, 15%, 12%)',
          accent: 'hsl(35, 25%, 18%)',
          border: 'hsl(35, 15%, 20%)',
        },
      },
    },
  },
  plugins: [],
}
