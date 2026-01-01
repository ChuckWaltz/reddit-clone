import { Flex, useColorModeValue } from "@chakra-ui/react";
import React from "react";

export type WrapperSize = "normal" | "small" | "large";

interface WrapperProps {
  size?: WrapperSize;
  formWrapper?: boolean;
}

const Wrapper: React.FC<WrapperProps> = ({
  children,
  size = "normal",
  formWrapper = false,
}) => {
  const formWrapperBGColor = useColorModeValue("white", "rgb(25, 25, 25)");

  return (
    <Flex
      w={size === "small" ? "400px" : size === "large" ? "800px" : "600px"}
      maxWidth="100vw"
      mx="auto"
      flexDir="column"
      px={4}
      py={formWrapper ? 4 : undefined}
      backgroundColor={formWrapper ? formWrapperBGColor : undefined}
      shadow={formWrapper ? "md" : undefined}
      borderRadius={formWrapper ? 5 : undefined}
      mt={formWrapper ? 8 : undefined}
      borderWidth={formWrapper ? 1 : undefined}
    >
      {children}
    </Flex>
  );
};
export default Wrapper;
