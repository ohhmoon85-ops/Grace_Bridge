import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // brand = 깊은 남빛(ink) 계열. 기존 파란색 자리를 전역 대체합니다.
        brand: {
          50: '#eceef5',
          100: '#d5d9e8',
          200: '#adb5cf',
          300: '#7d88ac',
          400: '#4c5a86',
          500: '#2c3a67',
          600: '#1D2440', // --ink (주요 버튼 배경)
          700: '#171d34',
          800: '#121729',
          900: '#0d101d',
        },
        // 완벽 예제 팔레트 토큰
        ink: { DEFAULT: '#1D2440', soft: '#3A4266' },
        paper: { DEFAULT: '#FBFAF6', dim: '#F1EFE7' },
        gold: { DEFAULT: '#B8912E', soft: '#E5D9B6' },
        violet: '#6B5B95',
        line: '#DAD6C8',
        danger: '#A8493E',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          'Noto Sans KR',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        serif: [
          'Gowun Batang',
          'Cormorant Garamond',
          'Noto Serif KR',
          'serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
