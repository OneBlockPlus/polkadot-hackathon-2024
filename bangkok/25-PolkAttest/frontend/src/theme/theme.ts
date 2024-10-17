import { extendTheme } from "@chakra-ui/react";

// Colores del Brandbook, con ajustes para mayor contraste
const colors = {
  brand: {
    primary: "#FF2670",   // Rosa para botones primarios, enlaces, etc.
    secondary: "#7204FF", // Morado para botones secundarios y acentos.
    background: "#E1E3F1", // Fondo claro para la página o tarjetas.
    white: "#FFFFFF",     // Textos sobre fondos oscuros.
    black: "#000000",     // Color negro para títulos y textos importantes.
    grayDark: "#333333",  // Un gris oscuro para fondos más oscuros.
    grayLight: "#F7F7F7", // Un gris claro para cajas o secciones.
    grayMedium: "#666666", // Un gris intermedio para texto y bordes.
  },
};

// Tipografía
const fonts = {
  heading: `'Poppins', sans-serif`,  // Para H1, H2, H3
  body: `'Inter', sans-serif`,       // Para textos y subtítulos
};

// Estilos globales y componentes personalizados
const styles = {
  global: {
    body: {
      bg: "brand.background",  // Fondo general claro
      color: "brand.black",    // Texto negro por defecto para contraste
    },
    a: {
      color: "brand.primary",  // Enlaces en rosa
      _hover: {
        color: "brand.secondary",  // Enlaces en hover morado
        textDecoration: "underline", // Subrayado en hover para mejor accesibilidad
      },
    },
  },
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: "bold",
      borderRadius: "8px",
      border: "none",  // Eliminamos el trazo en todos los botones
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
        bg: "brand.primary",   // Rosa como color base
        color: "brand.white",  // Texto blanco
        _hover: {
          bg: "brand.secondary",  // Cambia a morado en hover
        },
        _focus: {
          boxShadow: "none",    // Sin sombra en foco
        },
      },
      secondary: {
        bg: "brand.secondary",  // Morado como color base
        color: "brand.white",   // Texto blanco
        _hover: {
          bg: "brand.primary",  // Cambia a rosa en hover
        },
        _focus: {
          boxShadow: "none",    // Sin sombra en foco
        },
      },
      outline: {
        border: "none",         // Eliminamos el borde de la variante outline
        color: "brand.primary", // Texto rosa
        _hover: {
          bg: "brand.grayLight", // Fondo gris claro en hover
        },
      },
    },
  },
  // Otros componentes...
};

const theme = extendTheme({
  colors,
  fonts,
  styles,
  components,
});

export default theme;
