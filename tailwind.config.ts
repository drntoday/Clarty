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
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
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
                'glow-sm': '0 0 12px rgba(79, 70, 229, 0.15)',
                'glow-md': '0 0 20px rgba(79, 70, 229, 0.25)',
            },
        },
    },
    plugins: [],
};

export default config;
