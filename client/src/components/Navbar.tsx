import { Flex, Button, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { DarkModeSwitch } from "./DarkModeSwitch";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = ({}) => {
  const bg = useColorModeValue("gray.200", "rgb(25, 25, 25)");
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
          <Button mr={5}>Login</Button>
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
        <Button mr={5}>{data.me.username}</Button>
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
    >
      {userLinks}
      <DarkModeSwitch />
    </Flex>
  );
};

export default Navbar;
