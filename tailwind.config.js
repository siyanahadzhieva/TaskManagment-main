/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // ✅ Scan all JS/JSX files for Tailwind classes
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"], // ✅ Add Poppins as a font
      },
    },
  },
  plugins: [],
};
