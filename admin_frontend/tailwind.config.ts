import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper:  "#FAF6EE",
        card:   "#FFFFFF",
        line:   "#E7DFCD",
        "line-soft": "#F0E9D8",
        ink: {
          DEFAULT: "#2B2A23",
          dim:     "#736C58",
          faint:   "#A79F89",
        },
        forest: {
          DEFAULT: "#173229",
          2:       "#1F3F32",
          line:    "#2C5344",
          text:    "#EFEAD9",
          dim:     "#A9BBAE",
          faint:   "#6E8478",
        },
        gold: {
          DEFAULT: "#CE9A3E",
          dim:     "#F6ECD4",
          dark:    "#93691F",
        },
        rust: {
          DEFAULT: "#BC5A34",
          dim:     "#F5E1D5",
        },
        sage: {
          DEFAULT: "#5C8A61",
          dim:     "#E3EEE0",
          dark:    "#3E6A44",
        },
        rose: {
          DEFAULT: "#B15169",
          dim:     "#F5E1E6",
        },
        // keep blue/violet for Individual/Enterprise tab distinction
        primary: {
          50:  "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        mono:    ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "14px",
        sm2:  "9px",
      },
    },
  },
  plugins: [],
};

export default config;
