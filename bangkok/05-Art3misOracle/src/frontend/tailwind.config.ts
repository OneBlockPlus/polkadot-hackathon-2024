import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      colors: {
        blue: {
          400: '#2589FE',
          500: '#0070F3',
          600: '#2F6FEB',
        },
      },
    },
    keyframes: {
      glowPulse: {
        '0%, 100%': { boxShadow: '0 0 5px #FFB800, 0 0 8px #FFB800, 0 0 10px #FFB800, 0 0 14px #FFB800, 0 0 20px #FFB800' },
        '50%': { boxShadow: '0 0 10px #FFB800, 0 0 16px #FFB800, 0 0 20px #FFB800, 0 0 28px #FFB800, 0 0 40px #FFB800' },
      },
      shimmer: {
        '100%': {
          transform: 'translateX(100%)',
        },
      },
    },
    animation: {
      glowPulse: 'glowPulse 1.5s infinite alternate',
    }
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
