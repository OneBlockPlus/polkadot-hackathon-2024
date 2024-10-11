/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
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
  plugins: [],
  darkMode: "class"
};