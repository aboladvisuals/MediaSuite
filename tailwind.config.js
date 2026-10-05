/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "Segoe UI", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      colors: {
        ink: {
          950: "#090b10",
          900: "#0e1117",
          850: "#141820",
          800: "#1b202b",
          700: "#262d3b",
          600: "#343d50",
        },
        gold: {
          300: "#f0d78a",
          400: "#e2c36a",
          500: "#c9a44a",
          600: "#a78432",
        },
      },
      boxShadow: {
        panel: "0 18px 50px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
