/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--primary) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        kathmandu: "rgb(var(--kathmandu) / <alpha-value>)",
        pokhara: "rgb(var(--pokhara) / <alpha-value>)",
        rupandehi: "rgb(var(--rupandehi) / <alpha-value>)",
        dang: "rgb(var(--dang) / <alpha-value>)",
        birgunj: "rgb(var(--birgunj) / <alpha-value>)",
        farwest: "rgb(var(--farwest) / <alpha-value>)",
        koshi: "rgb(var(--koshi) / <alpha-value>)",
        chitwan: "rgb(var(--chitwan) / <alpha-value>)",
        lbkarnali: "rgb(var(--karnali) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
