/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-primary": "#0d47a1",
        "brand-secondary": "#1976d2",
        accent: "#ffc107",
      },
      animation: {
        "slide-in": "slide-in 0.5s ease-out forwards",
      },
      keyframes: {
        "slide-in": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
