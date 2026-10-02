import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Design system color tokens (blueprint §3.4) ──────
      colors: {
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        "surface-hover": "hsl(var(--surface-hover))",
        border: "hsl(var(--border))",
        foreground: "hsl(var(--foreground))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--foreground))",
        },
        input: "hsl(var(--border))",
        ring: "hsl(var(--primary))",
      },
      // ── Typography ───────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "1.5" }],
        sm: ["14px", { lineHeight: "1.5" }],
        base: ["16px", { lineHeight: "1.5" }],
        lg: ["18px", { lineHeight: "1.5" }],
        xl: ["22px", { lineHeight: "1.2" }],
        "2xl": ["28px", { lineHeight: "1.2" }],
        "3xl": ["36px", { lineHeight: "1.1" }],
        "4xl": ["48px", { lineHeight: "1.05" }],
      },
      // ── Border radius ─────────────────────────────────────
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
        full: "9999px",
      },
      // ── Animations ────────────────────────────────────────
      keyframes: {
        "fade-slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "success-pulse": {
          "0%, 100%": { backgroundColor: "hsl(var(--surface))" },
          "50%": { backgroundColor: "hsl(var(--success) / 0.15)" },
        },
        "scale-bounce": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        "skeleton-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(108, 92, 231, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(108, 92, 231, 0.5)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-slide-up": "fade-slide-up 0.2s ease-out",
        "success-pulse": "success-pulse 0.4s ease-in-out",
        "scale-bounce": "scale-bounce 0.15s ease-in-out",
        "skeleton-pulse": "skeleton-pulse 1.5s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 3s ease-in-out infinite",
        "slide-down": "slide-down 0.2s ease-out",
      },
      // ── Box shadows ───────────────────────────────────────
      boxShadow: {
        "card-primary":
          "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(108, 92, 231, 0.1)",
        "card": "0 4px 20px rgba(0, 0, 0, 0.3)",
        "glow-primary": "0 0 30px rgba(108, 92, 231, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
