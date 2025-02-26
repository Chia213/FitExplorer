/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f1ff",
          100: "#cce3ff",
          200: "#99c8ff",
          300: "#66adff",
          400: "#3392ff",
          500: "#0077ff",
          600: "#005fcc",
          700: "#004799",
          800: "#003066",
          900: "#001833",
        },
        secondary: {
          50: "#e6fff9",
          100: "#ccfff3",
          200: "#99ffe7",
          300: "#66ffdb",
          400: "#33ffcf",
          500: "#00ffc3",
          600: "#00cca3",
          700: "#009982",
          800: "#006652",
          900: "#003329",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
