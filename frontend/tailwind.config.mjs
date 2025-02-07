
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        editor:'#282a33',
        white_bg:"#FFF6E9",
        output_white:"#d1c9be",
        hover_editor: '#24262b',
        buttonRed:"#FF7777",
        output:"#15161a",
        suggestion_hover:"#3c3f4d",
        highlight_bg: "rgba(104, 110, 134, 0.4)",

      }
    },
  },
  plugins: [],
}
