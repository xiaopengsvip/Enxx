import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        ocean: "#0ea5e9",
        violet: "#8b5cf6",
        glass: "rgba(255, 255, 255, 0.68)",
      },
      boxShadow: {
        glass: "0 24px 80px rgba(15, 23, 42, 0.12)",
        glow: "0 0 44px rgba(14, 165, 233, 0.28)",
      },
      backgroundImage: {
        "learning-grid":
          "linear-gradient(rgba(14,165,233,.13) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,.13) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
