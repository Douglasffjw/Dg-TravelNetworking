/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FEF7EC",
        primary: "#394C97",
        accent: "#FE5900",
        dark: "#262626",
      },
    },
  },
  plugins: [],
};
