import { extendTheme } from "@chakra-ui/react";
import { createBreakpoints, mode } from "@chakra-ui/theme-tools";

const fonts = { mono: `'Menlo', monospace` };

const breakpoints = createBreakpoints({
  sm: "40em",
  md: "52em",
  lg: "64em",
  xl: "80em",
});

const styles = {
  global: (props: Record<string, any>) => ({
    body: {
      color: mode("gray.800", "whiteAlpha.900")(props),
      bg: mode("whiteAlpha.900", "rgb(38, 38, 38)")(props),
    },
  }),
};

const theme = extendTheme({
  colors: {
    black: "#16161D",
  },
  fonts,
  breakpoints,
  styles,
});

export default theme;
