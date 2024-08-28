import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./public/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './features/**/*.{js,ts,jsx,tsx}', './components/components/**/*.{js,ts,jsx,tsx}', './node_modules/@heathmont/moon-core-tw/**/*.{js,ts,jsx,tsx}', './node_modules/@heathmont/moon-table-tw/**/*.{js,ts,jsx,tsx}'],
  presets: [require('@heathmont/moon-core-tw/lib/private/presets/ds-moon-preset.js')],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-header': 'linear-gradient(0deg, #ec1f52 -366.48%, #09013e 100%)'
      },
      backgroundColor: {
        brief: 'rgba(31, 31, 31, 1)',
        pan: 'rgba(68,68,68, 1)'
      },
      textColor: {
        brief: 'rgba(31, 31, 31, 1)',
        pan: 'rgba(68,68,68, 1)'
      },
      screens: {
        xs: '460px'
      },
      minHeight: {
        'full-min-header': 'calc(100vh - 80px)'
      },
      container: {
        center: true,
        padding: '2rem',
        screens: {
          DEFAULT: '100%',
          sm: '100%',
          md: '900px',
          lg: '900px',
          xl: '900px',
          '2xl': '900px'
        }
      }
    }
  },
  plugins: []
};
export default config;
