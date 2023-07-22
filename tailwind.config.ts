import type { Config } from "tailwindcss";

import defaultTheme from "tailwindcss/defaultTheme";
import colors from "tailwindcss/colors";
import {
  colorPrimary100,
  colorPrimary200,
  colorPrimary300,
  colorPrimary400,
  colorPrimary500,
  colorPrimary600,
  colorPrimary700,
  colorPrimary800,
  colorPrimary900,
  colorSecondary100,
  colorSecondary200,
  colorSecondary300,
  colorSecondary400,
  colorSecondary500,
  colorSecondary600,
  colorSecondary700,
  colorSecondary800,
  colorSecondary900,
} from "./figma.vars";

const theme = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    // extensions
    extend: {
      fontFamily: {
        sans: ["Noto Sans", ...defaultTheme.fontFamily.sans],
      },
    },

    // overrides
    colors: {
      // tw defaults reduced
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      gray: colors.zinc, // remap

      teal: colors.teal,
      orange: colors.orange,
      rose: colors.rose,
      violet: colors.violet,
      cyan: colors.cyan,

      // "arbitrary"
      primary: {
        100: colorPrimary100,
        200: colorPrimary200,
        300: colorPrimary300,
        400: colorPrimary400,
        500: colorPrimary500,
        600: colorPrimary600,
        700: colorPrimary700,
        800: colorPrimary800,
        900: colorPrimary900,
      },
      secondary: {
        100: colorSecondary100,
        200: colorSecondary200,
        300: colorSecondary300,
        400: colorSecondary400,
        500: colorSecondary500,
        600: colorSecondary600,
        700: colorSecondary700,
        800: colorSecondary800,
        900: colorSecondary900,
      },
      // default: "#1E1E1E",
    },
  },
  plugins: [],
} satisfies Config;

export default theme;
