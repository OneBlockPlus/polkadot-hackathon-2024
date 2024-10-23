import flowbite from "flowbite-react/tailwind";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)"],
      },
      colors: {
        "background-color": "var(--background-color)",
        "foreground-color": "var(--foreground-color)",
        "accent-color": "var(--accent-color)",
        "text-primary-color": "var(--text-primary-color)",
        "text-secondary-color": "var(--text-secondary-color)",
        "button-primary-color": "var(--button-primary-color)",
        "border-color": "var(--border-color)",
        "header-border-color": "var(--header-border-color)",
      },
      fontSize: {
        normal: ["1.25rem", "2rem"],
        header: ["2.5rem", "3rem"],
        sub: ["0.9375rem", "1.125rem"],
      },
      backgroundColor: {
        hoverBg: "var(--hover-bg)",
      },
      minHeight: {
        main: "calc(100dvh - 75px - 370px)",
      },
    },
  },
  plugins: [flowbite.plugin()],
};
export default config;
