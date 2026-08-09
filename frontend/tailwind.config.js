/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          DEFAULT: "#1B2430",
          light: "#26313F",
          dark: "#121924",
        },
        frost: {
          DEFAULT: "#2E6E9E",
          light: "#4A8FC2",
          dark: "#20537A",
        },
        ice: {
          DEFAULT: "#F4F7F9",
          dim: "#E7EDF1",
        },
        ember: {
          DEFAULT: "#C1652F",
          light: "#D98449",
          dark: "#9C4E22",
        },
        slate: {
          DEFAULT: "#5B6B7C",
          light: "#8493A2",
        },
        mint: {
          DEFAULT: "#2F9E6E",
          light: "#4CBB89",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "dial-radial": "radial-gradient(circle at center, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
