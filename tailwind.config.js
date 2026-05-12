/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00f0ff",
        secondary: "#ff0055",
        glass: "rgba(20, 20, 25, 0.6)",
      },
    },
  },
  plugins: [],
}
