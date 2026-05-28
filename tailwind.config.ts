import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#faf7f2',
          deep: '#f3ede3',
        },
        champagne: {
          DEFAULT: '#c9a978',
          soft: '#e6d4b6',
          deep: '#a98555',
        },
        charcoal: {
          DEFAULT: '#1f1d1a',
          soft: '#2c2a26',
        },
        slate: {
          DEFAULT: '#5a5a64',
        },
        mist: '#8a8a92',
        line: 'rgba(31,29,26,0.08)',
        'line-strong': 'rgba(31,29,26,0.14)',
        'blue-gray': {
          DEFAULT: '#6b7a8c',
          soft: '#dde4ec',
        },
        success: {
          DEFAULT: '#4a7c59',
          bg: '#e8f0ea',
        },
        warning: {
          DEFAULT: '#b8821b',
          bg: '#fbf2dc',
        },
        danger: {
          DEFAULT: '#b54848',
          bg: '#f9e6e6',
        },
        info: {
          DEFAULT: '#4a6b8a',
          bg: '#e6edf4',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Times New Roman', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 2px rgba(31,29,26,0.04), 0 2px 8px rgba(31,29,26,0.04)',
        'soft-md': '0 4px 12px rgba(31,29,26,0.06), 0 12px 32px rgba(31,29,26,0.05)',
        'soft-lg': '0 8px 24px rgba(31,29,26,0.08), 0 24px 56px rgba(31,29,26,0.08)',
        'champagne': '0 6px 16px rgba(169,133,85,0.25)',
        'fab': '0 8px 22px rgba(169,133,85,0.4), 0 2px 6px rgba(169,133,85,0.2)',
      },
      borderRadius: {
        'phone': '34px',
        'phone-outer': '42px',
      },
      animation: {
        pulse: 'pulse 2.2s ease-in-out infinite',
        'load-sweep': 'load-sweep 1.6s ease-in-out infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(74,124,89,0.4)' },
          '50%': { boxShadow: '0 0 0 4px rgba(74,124,89,0)' },
        },
        'load-sweep': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(350%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
