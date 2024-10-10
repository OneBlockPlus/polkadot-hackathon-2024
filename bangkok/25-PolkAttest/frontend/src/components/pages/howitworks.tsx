import { Box, Heading, Flex, Text, Button, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom"; // Para redirigir

function HowItWorks() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate(); // Hook para redirigir

  const slides = [
    {
      title: "Create a Schema",
      image: "/path/to/image1.png",
      description: "Description for creating a schema. You can explain the process here.",
      buttonLabel: "Create New Schema",
      buttonRoute: "/createschema",
    },
    {
      title: "Make an Attestation",
      image: "/path/to/image2.png",
      description: "Description for making an attestation. You can explain the process here.",
      buttonLabel: "Make Attestation",
      buttonRoute: "/attestations",
    },
  ];

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <Flex
      direction="column"
      w="100%"
      minH="100vh"
      alignItems="center"
      justifyContent="center"
      bg="#000000" // Fondo negro
      color="#FFFFFF" // Fuentes blancas
    >
      <Heading as="h2" mb={6}>
        How it Works
      </Heading>

      {/* Contenedor dividido en 3 secciones */}
      <Flex w="100%" maxW="1200px" h="60vh" justifyContent="space-between" alignItems="center">
        {/* Flecha izquierda */}
        <IconButton
          aria-label="Previous slide"
          icon={<ChevronLeftIcon />}
          size="lg"
          bg="transparent"
          color="brand.secondary"
          _hover={{ bg: "transparent" }}
          onClick={handlePrevious}
        />

        {/* Sección central más grande */}
        <Box flex="2" textAlign="center">
          {/* Carrusel */}
          <Box textAlign="center" w="100%" p={6}>
            {/* Espacio para la imagen */}
            <Box h="200px" mb={4}>
              {/* Placeholder de la imagen */}
              <Text>Image Carousel</Text>
            </Box>

            {/* Título del slide */}
            <Heading as="h3" fontSize="xl" mb={4}>
              {slides[currentSlide].title}
            </Heading>

            {/* Descripción del slide */}
            <Text mb={6}>{slides[currentSlide].description}</Text>

            {/* Botón condicional para navegar a las rutas */}
            <Button
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.secondary" }}
              border="none"
              onClick={() => navigate(slides[currentSlide].buttonRoute)}
            >
              {slides[currentSlide].buttonLabel}
            </Button>
          </Box>
        </Box>

        {/* Flecha derecha */}
        <IconButton
          aria-label="Next slide"
          icon={<ChevronRightIcon />}
          size="lg"
          bg="transparent"
          color="brand.secondary"
          _hover={{ bg: "transparent" }}
          onClick={handleNext}
        />
      </Flex>
    </Flex>
  );
}

export default HowItWorks;
