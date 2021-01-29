import { Box } from "@chakra-ui/react";
import React from "react";

interface WrapperProps {
  size?: "normal" | "small" | "large";
}

const Wrapper: React.FC<WrapperProps> = ({ children, size = "normal" }) => {
  return (
    <Box
      maxW={size === "small" ? "400px" : size === "large" ? "1200px" : "800px"}
      w="100%"
      mx="auto"
    >
      {children}
    </Box>
  );
};
export default Wrapper;
