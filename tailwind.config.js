/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      maxWidth : {
        "custom": "calc(100% - 250px)",
        "custom2": "calc(100% - 50px)",
      },
      transitionProperty: {
        "margin": "margin",
        "width": "width",
      },
      animation: {
        tilt: "tilt 10s infinite linear"
      },
      keyframes: {
        tilt: {
          "0%, 50%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(2deg)" },
          "75%": { transform: "rotate(-2deg)" },
        },
      },
    },
  },
  plugins: [],
};

