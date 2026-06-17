import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        muted: "#5B6472",
        line: "#E3E8EF",
        surface: "#F7F9FC",
        brand: {
          50: "#EFF8FF",
          100: "#D8EEFF",
          500: "#1769E0",
          600: "#145BC3",
          700: "#114CA3"
        },
        signal: {
          green: "#16825D",
          amber: "#B7791F",
          red: "#C24132"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(17, 24, 39, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
