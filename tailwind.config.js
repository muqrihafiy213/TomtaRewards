/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors:{
        primary: "#FCE0E5",
        secondary: "#2F2D52",
        buttons: "#817EB8"
      },
      fontFamily: {
        sans: ['Roboto', 'ui-sans-serif', 'system-ui', '-apple-system'],
      },
      screens: {
        'sm': {'max': '639px'},
        '2xl': {'min': '1536px'},
      }
    },
  },
  plugins: [],
})

