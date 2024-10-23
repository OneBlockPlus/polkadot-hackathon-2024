import { Box, Flex, Heading, keyframes, Image } from "@chakra-ui/react";
import Spline from "@splinetool/react-spline";
import icon from "../../assets/images/polkattest_icon_graywhite.png";

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

function MainSection() {
  return (
    <Flex
      flexDirection="column"
      w="100%"
      h="calc(100vh - 4rem)"
      bgGradient="linear(to-r, #7204ff, #FF2670)"
      backgroundSize="200% 200%"
      animation={`${gradientAnimation} 10s ease infinite`}
      justifyContent="center"
      alignItems="center"
      position="relative"
    >
      <Box textAlign="center" zIndex="1">
        <Box display={"flex"} flexDir={"row"} justifyContent={"center"}>
          <Image src={icon} h={20} mr={2}></Image>
          <Heading fontSize="4rem" color="white">
            Polkattest
          </Heading>
        </Box>
        <Heading as="h2" fontSize="2rem" color="white" mt="1rem">
          Attestation hub for Polkadot Ecosystem
        </Heading>
      </Box>
      <Flex position="absolute" top="0" left="0" w="100%" h="100%" zIndex="0">
        <Spline scene="https://prod.spline.design/JXA2-y0Og7K6LTUi/scene.splinecode" />
      </Flex>
    </Flex>
  );
}

export default MainSection;
