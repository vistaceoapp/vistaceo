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
        background: "hsl(240, 10%, 3.9%)",
        foreground: "hsl(0, 0%, 98%)",
        primary: {
          DEFAULT: "hsl(262, 83%, 58%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        secondary: {
          DEFAULT: "hsl(240, 3.7%, 15.9%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        muted: {
          DEFAULT: "hsl(240, 3.7%, 15.9%)",
          foreground: "hsl(240, 5%, 64.9%)",
        },
        accent: {
          DEFAULT: "hsl(262, 83%, 58%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        border: "hsl(240, 3.7%, 15.9%)",
        card: {
          DEFAULT: "hsl(240, 10%, 3.9%)",
          foreground: "hsl(0, 0%, 98%)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            color: "hsl(0, 0%, 98%)",
            a: {
              color: "hsl(262, 83%, 58%)",
              "&:hover": {
                color: "hsl(262, 83%, 68%)",
              },
            },
            h1: { color: "hsl(0, 0%, 98%)" },
            h2: { color: "hsl(0, 0%, 98%)" },
            h3: { color: "hsl(0, 0%, 98%)" },
            h4: { color: "hsl(0, 0%, 98%)" },
            strong: { color: "hsl(0, 0%, 98%)" },
            code: { color: "hsl(262, 83%, 68%)" },
            blockquote: {
              color: "hsl(240, 5%, 64.9%)",
              borderLeftColor: "hsl(262, 83%, 58%)",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
