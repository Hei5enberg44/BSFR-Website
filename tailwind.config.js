/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,ts}'],
    theme: {
        screens: {
            sm: '640px',
            // => @media (min-width: 640px) { ... }

            md: '840px',
            // => @media (min-width: 840px) { ... }

            lg: '1024px',
            // => @media (min-width: 1024px) { ... }

            xl: '1280px',
            // => @media (min-width: 1280px) { ... }

            '2xl': '1536px'
            // => @media (min-width: 1536px) { ... }
        },
        extend: {
            keyframes: {
                rankedlePlayBtn: {
                    '0%': { color: '#3498db' },
                    '50%': { color: '#c666c7' },
                    '100%': { color: '#e74d3c' }
                },
                rankedleSong: {
                    '0%': { left: '5%', opacity: 0 },
                    '100%': { left: '0', opacity: 1 }
                }
            },
            animation: {
                rankedlePlayBtn: 'rankedlePlayBtn 30s linear 1',
                rankedleSong: 'rankedleSong 250ms ease-out 1'
            }
        }
    },
    plugins: [],
    corePlugins: {
        preflight: false
    }
}
