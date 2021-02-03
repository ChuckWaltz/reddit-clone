import { Flex } from "@chakra-ui/react";
import React from "react";

export type WrapperSize = "normal" | "small" | "large";

interface WrapperProps {
  size?: WrapperSize;
}

const Wrapper: React.FC<WrapperProps> = ({ children, size = "normal" }) => {
  return (
    <Flex
      maxW={size === "small" ? "400px" : size === "large" ? "1000px" : "700px"}
      w="100%"
      mx="auto"
      flexDir="column"
    >
      {children}
    </Flex>
  );
};
export default Wrapper;
