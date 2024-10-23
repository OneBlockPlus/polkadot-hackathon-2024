/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: "#93BBFB",
          "primary-content": "#212638",
          secondary: "#DAE8FF",
          "secondary-content": "#212638",
          accent: "#93BBFB",
          "accent-content": "#212638",
          neutral: "#212638",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f4f8ff",
          "base-300": "#DAE8FF",
          "base-content": "#212638",
          info: "#93BBFB",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
      {
        dark: {
          primary: "#212638",
          "primary-content": "#F9FBFF",
          secondary: "#323f61",
          "secondary-content": "#F9FBFF",
          accent: "#4969A6",
          "accent-content": "#F9FBFF",
          neutral: "#F9FBFF",
          "neutral-content": "#385183",
          "base-100": "#385183",
          "base-200": "#2A3655",
          "base-300": "#212638",
          "base-content": "#F9FBFF",
          info: "#385183",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      backgroundImage: {
        'hero-button':
          'linear-gradient(98deg, #000 9.17%, rgba(112, 113, 232, 0.02) 120.09%)',
        'hero-button-stroke':
          'linear-gradient(98deg, #000 9.17%, rgba(112, 113, 232, 0.02) 120.09%)',
        'credibility-staking-rewards-gradient':
          'linear-gradient(145deg, #fff -11.19%, #7071E8 114.37%)',
          'credibility-staking-rewards-gradient-dark':
          'linear-gradient(145deg, #000 -11.19%, #7071E8 114.37%)',
        'credibility-staking-livefeed':
          'linear-gradient(90deg, #7071E8 0%, rgba(63, 63, 130, 0.30) 100%)',
        'claim-btn-gradient': 'linear-gradient(90deg, #07d3ba 0%, #000 100%)',
        'airdrop-gradient':
          'linear-gradient(117deg, #7071E8 3.51%, #3F3F82 65.28%)',
      },
    },
  },
};
