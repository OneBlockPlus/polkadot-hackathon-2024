/*
 * @Descripttion: 
 * @version: Hesin
 * @Author: 
 * @Date: 2024-08-21 15:11:21
 * @LastEditors: Hesin
 * @LastEditTime: 2024-08-26 05:11:04
 */
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "15px",
      screens: {
        "sm": "640px",
        "md": "768px",
        "kg": "960px",
        "xl": "1200px",
        "2xl": "1400px",
      },
    },
    fontFamily: {
      primary: "var(--font-Inter)",
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      colors: {
        primary: '#1c1c22',
        accent: {
          DEFAULT: '#00ff99',
          hover: "#00e187"
        }
      },
      
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config