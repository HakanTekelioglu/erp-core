import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans]
      },
      colors: {
        // Modern neutral palette: legacy slate/blue utilities map to zinc/indigo.
        slate: colors.zinc,
        blue: colors.indigo,
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        brand: {
          DEFAULT: "rgb(var(--color-brand) / <alpha-value>)",
          foreground: "rgb(var(--color-brand-foreground) / <alpha-value>)"
        },
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)"
      },
      borderRadius: {
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem"
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        soft: "0 1px 2px rgb(0 0 0 / 0.04), 0 12px 32px -12px rgb(24 24 27 / 0.14)"
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
