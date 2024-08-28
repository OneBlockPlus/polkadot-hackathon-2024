/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whitesmoke: {
          "100": "#eff4f6",
          "200": "#efefef",
        },
        white: "#fff",
        "green-1000": "#111b3c",
        "green-50": "#f8f8ff",
        "green-100": "#ecedff",
        "mediumpurple": "#8975ea",
        "green-400": "#4e7fff",
        "blue-700": "#004eb7",
        "green-900": "#003855",
        "green-0": "#fff",
        "kale-900": "#174e45",
        "green-10": "#f1f7f5",
        "white-50": "#f3f3f6",
        "green-200": "#bec6ff",
        "darkseagreen": "#7da78e",
        "gainsboro": "rgba(217, 217, 217, 0.4)",
        "powderblue": "#97beb5",
        "black": "#000",
        darkslategray: "#3d6470",
        "white-10": "#fbfbfb",
        "grey-500": "#858586",
        bg: "#f8f8ff",
        "green-9001": "#1f353c",
        "grey-5001": "#858597",
      },
      spacing: {
        xl: "120px",
        l: "60px",
        s: "20px",
        m: "40px",
      },
      fontFamily: {
        karla: "Karla",
        manrope: "Manrope",
        "karla-text-bold": "Karla",
        "manrope-25px-regular": "Manrope",
      },
      borderRadius: {
        "41xl": "60px",
        "51xl": "70px",
        "142xl": "161px",
        l: "60px",
      },
      backgroundImage: {
      'loading': "lazy"
      },
      // fontSize: {
      //   "20xl": "39px",
      //   "4xl": "23px",
      //   "12xl": "31px",
      //   "6xl": "25px",
      //   xl: "20px",
      //   base: "16px",
      //   "8xl": "27px",
      //   inherit: "inherit",
      // },
      // screens: {
      //   mq1350: {
      //     raw: "screen and (max-width: 1350px)",
      //   },
      //   mq1125: {
      //     raw: "screen and (max-width: 1125px)",
      //   },
      //   mq800: {
      //     raw: "screen and (max-width: 800px)",
      //   },
      //   mq450: {
      //     raw: "screen and (max-width: 450px)",
      //   },
      // },
  },
},
plugins: [],
};
