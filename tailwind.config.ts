import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        wisepix: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bce0ff",
          300: "#8ed0ff",
          400: "#59b4ff",
          500: "#1687ff",
          600: "#066be8",
          700: "#0756bb",
          800: "#0b478f",
          900: "#0f3c76",
          950: "#081d39"
        },
        premium: {
          black: "#05070b",
          ink: "#10141f",
          line: "#d7e2f0"
        }
      },
      boxShadow: {
        soft: "0 18px 70px rgba(8, 29, 57, 0.12)"
      }
    }
  },
  plugins: [forms]
};

export default config;
