/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#7B5EA7',
                    light: '#9B7FC7',
                    dark: '#5B3E87',
                    50: '#f5f0fa',
                    100: '#ebe1f5',
                    200: '#d7c3eb',
                    300: '#c3a5e1',
                    400: '#af87d7',
                    500: '#7B5EA7',
                    600: '#6a5090',
                    700: '#5B3E87',
                    800: '#4a2d6e',
                    900: '#3a1d55',
                },
                dark: {
                    DEFAULT: '#373737',
                    light: '#4a4a4a',
                    lighter: '#666666',
                },
                gray: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#eeeeee',
                    250: '#F2F2F2',
                    300: '#e0e0e0',
                    400: '#bdbdbd',
                    500: '#9e9e9e',
                    600: '#757575',
                    700: '#616161',
                    800: '#424242',
                    900: '#212121',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
