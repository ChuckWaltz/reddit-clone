import { Flex } from "@chakra-ui/react";
import React from "react";

export type WrapperSize = "normal" | "small" | "large";

interface WrapperProps {
  size?: WrapperSize;
}

const Wrapper: React.FC<WrapperProps> = ({ children, size = "normal" }) => {
  return (
    <Flex
      w={size === "small" ? "400px" : size === "large" ? "800px" : "600px"}
      maxWidth="95vw"
      mx="auto"
      flexDir="column"
    >
      {children}
    </Flex>
  );
};
export default Wrapper;
