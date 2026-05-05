import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'purple-deep':  '#1a0533',
        'purple-mid':   '#2d1b69',
        'purple-light': '#4c2d8f',
        gold:           '#f5c842',
        'gold-dark':    '#c49a1a',
        teal:           '#00d4aa',
        'green-neon':   '#39ff14',
        'red-bright':   '#ff3d3d',
      },
      fontFamily: {
        heading: ["'Fredoka One'", 'cursive'],
        body:    ["'Inter'", 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
