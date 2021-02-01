import { Flex, Button, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { DarkModeSwitch } from "./DarkModeSwitch";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { colorScheme } from "../utils/constants";

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = ({}) => {
  const bg = useColorModeValue("white", "rgb(25, 25, 25)");
  const color = useColorModeValue("gray.800", "white");

  const [{ data, fetching }] = useMeQuery({ pause: isServer() }); // Pause options tells this to not run if on server (ssr) -- is causing console warning..??
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  let userLinks = null;
  if (fetching) {
    // Do nothing
  } else if (!data?.me) {
    // User not logged in
    userLinks = (
      <>
        <NextLink href="/login">
          <Button mr={5} colorScheme={colorScheme}>
            Login
          </Button>
        </NextLink>
        <NextLink href="/register">
          <Button mr={5}>Register</Button>
        </NextLink>
      </>
    );
  } else {
    // User logged in
    userLinks = (
      <>
        <Button mr={5} colorScheme={colorScheme}>
          {data.me.username}
        </Button>
        <Button
          onClick={async () => {
            logout();
          }}
          isLoading={logoutFetching}
          mr={5}
        >
          Logout
        </Button>
      </>
    );
  }

  return (
    <Flex
      bg={bg}
      color={color}
      padding="15px 10px"
      justifyContent="flex-end"
      alignItems="center"
      position="sticky"
      top={0}
      zIndex={100}
      style={{ boxShadow: "0px 0px 1px 1px rgba(0,0,0,0.5)" }}
    >
      <NextLink href="/">
        <Button mr="auto" colorScheme={colorScheme}>
          Home
        </Button>
      </NextLink>
      {userLinks}
      <DarkModeSwitch />
    </Flex>
  );
};

export default Navbar;
