import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    // Path yang benar untuk memindai semua file di dalam `src`
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // fontFamily bisa dihapus dari sini jika tidak ada customisasi lain
      colors: {},
      // ...
    },
  },
  plugins: [],
};
export default config;
