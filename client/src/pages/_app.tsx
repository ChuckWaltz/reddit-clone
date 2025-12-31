import theme from "../theme";
import { AppProps } from "next/app";
import { ChakraProvider, Flex, Spinner } from "@chakra-ui/react";
import { colorScheme } from "../utils/constants";

import Router from "next/router";
import React, { useEffect } from "react";

Router.events.on("routeChangeStart", () => {
  let loadingOverlay = document.getElementById("loading-overlay");
  loadingOverlay!.style.display = "flex";
});
Router.events.on("routeChangeComplete", () => {
  let loadingOverlay = document.getElementById("loading-overlay");
  loadingOverlay!.style.display = "none";
});
Router.events.on("routeChangeError", () => {
  let loadingOverlay = document.getElementById("loading-overlay");
  loadingOverlay!.style.display = "none";
});

function MyApp({ Component, pageProps }: AppProps) {
  const loadingOverlayBgColor = `${colorScheme}.500`;

  // Hide initial splash screen once app is loaded
  useEffect(() => {
    const splash = document.getElementById("initial-splash");
    if (splash) {
      splash.classList.add("hidden");
      // Remove from DOM after fade out animation
      setTimeout(() => {
        splash.remove();
      }, 300);
    }
  }, []);

  return (
    <ChakraProvider resetCSS theme={theme}>
      <Flex
        id="loading-overlay"
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        p={3}
        zIndex={1000}
        backgroundColor={loadingOverlayBgColor}
        borderRadius={100}
        display="none"
      >
        <Spinner color="white" size="lg" />
      </Flex>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
