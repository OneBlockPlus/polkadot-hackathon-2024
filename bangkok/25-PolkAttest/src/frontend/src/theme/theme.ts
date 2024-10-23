import { extendTheme } from "@chakra-ui/react";

const colors = {
  brand: {
    primary: "#FF2670",
    secondary: "#7204FF",
    background: "#E1E3F1",
    white: "#FFFFFF",
    black: "#000000",
    grayDark: "#333333",
    grayLight: "#F7F7F7",
    grayMedium: "#666666",
  },
};

const fonts = {
  heading: `'Poppins', sans-serif`,
  body: `'Inter', sans-serif`,
};

const styles = {
  global: {
    body: {
      bg: "brand.background",
      color: "brand.black",
    },
    a: {
      color: "brand.primary",
      _hover: {
        color: "brand.secondary",
        textDecoration: "underline",
      },
    },
  },
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: "bold",
      borderRadius: "8px",
      border: "none",
    },
    sizes: {
      lg: {
        h: "56px",
        fontSize: "lg",
        px: "32px",
      },
      md: {
        h: "48px",
        fontSize: "md",
        px: "24px",
      },
      sm: {
        h: "40px",
        fontSize: "sm",
        px: "16px",
      },
    },
    variants: {
      primary: {
        bg: "brand.primary",
        color: "brand.white",
        _hover: {
          bg: "brand.secondary",
        },
        _focus: {
          boxShadow: "none",
        },
      },
      secondary: {
        bg: "brand.secondary",
        color: "brand.white",
        _hover: {
          bg: "brand.primary",
        },
        _focus: {
          boxShadow: "none",
        },
      },
      outline: {
        border: "none",
        color: "brand.primary",
        _hover: {
          bg: "brand.grayLight",
        },
      },
    },
  },
};

const theme = extendTheme({
  colors,
  fonts,
  styles,
  components,
});

export default theme;
