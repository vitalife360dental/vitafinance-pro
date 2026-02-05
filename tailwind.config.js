/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2563eb', // Royal Blue
                    50: '#eff6ff',
                    100: '#dbeafe',
                    600: '#2563eb',
                    700: '#1d4ed8',
                },
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9', // Main App BG
                    200: '#e2e8f0', // Borders
                    300: '#cbd5e1',
                    500: '#64748b', // Subtitles
                    800: '#1e293b', // Headings
                    900: '#0f172a',
                }
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
