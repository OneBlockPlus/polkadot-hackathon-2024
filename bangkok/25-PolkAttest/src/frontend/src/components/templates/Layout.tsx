import { Outlet } from "react-router-dom";
import Header from "./Header/Header";
import Footer from "../pages/footer";
import { Flex } from "@chakra-ui/react";

const Layout = () => {
  return (
    <Flex direction="column" h="100vh" w="100%">
      <Header />
      <Flex as="main" flex="1">
        <Outlet />
      </Flex>
      <Footer />
    </Flex>
  );
};

export default Layout;
