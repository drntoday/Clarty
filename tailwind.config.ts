import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Clarity Nexus Design System Colors
        clarity: {
          bg: {
            light: '#ffffff',
            dark: '#1a1a1a',
          },
          surface: {
            light: '#f8f9fa',
            dark: '#242424',
          },
          primary: {
            DEFAULT: '#1a73e8',
            hover: '#1557b0',
            light: '#8ab4f8',
            lighter: '#aecbfa',
          },
          success: {
            DEFAULT: '#0f9d58',
            light: '#34a853',
          },
          warning: {
            DEFAULT: '#f9ab00',
            light: '#fbbc04',
          },
          error: {
            DEFAULT: '#ea4335',
            light: '#ff6b6b',
          },
          text: {
            primary: {
              light: '#202124',
              dark: '#e8eaed',
            },
            secondary: {
              light: '#5f6368',
              dark: '#9aa0a6',
            },
          },
          border: {
            light: '#dadce0',
            dark: '#3c4043',
          },
        },
        // Legacy custom colors for backward compatibility
        zinc: {
          450: '#8a8fa1',
          550: '#5a5f72',
          650: '#3d4152',
          850: '#20222b',
          855: '#23252f',
        },
        indigo: {
          450: '#8495f5',
          550: '#5c6ac4',
          650: '#3f4a9c',
        },
        rose: {
          450: '#f78da7',
        },
        amber: {
          450: '#f5c542',
        },
        emerald: {
          450: '#4ade80',
        },
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)',
        'button-hover': '0 2px 6px 2px rgba(60,64,67,.15), 0 1px 2px 0 rgba(60,64,67,.3)',
        'glow-sm': '0 0 12px rgba(79, 70, 229, 0.15)',
        'glow-md': '0 0 20px rgba(79, 70, 229, 0.25)',
      },
      borderRadius: {
        'card': '12px',
        'button': '24px',
        'chip': '9999px',
      },
      transitionDuration: {
        '200': '200ms',
      },
    },
  },
  plugins: [],
};

export default config;
