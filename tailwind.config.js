import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                ink: {
                    base: '#0E0B1D',
                    deep: '#2A1E4D',
                    deepPurple: '#5A3B8C',
                    softPurple: '#8B7CC7',
                    lightPurple: '#C9C2E3',
                    border: '#3A3A52',
                }
            },
        },
    },

    plugins: [forms],
};
