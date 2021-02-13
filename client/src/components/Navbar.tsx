import {
  Flex,
  Button,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Icon,
  Link,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import React from "react";
import { DarkModeSwitch } from "./DarkModeSwitch";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { colorScheme } from "../utils/constants";
import { GiWalrusHead, GiWaterSplash } from "react-icons/gi";
import { SearchIcon } from "@chakra-ui/icons";

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = ({}) => {
  const bg = useColorModeValue("white", "rgb(25, 25, 25)");
  const color = useColorModeValue("gray.800", "white");
  const linkColor = useColorModeValue(
    `${colorScheme}.500`,
    `${colorScheme}.400`
  );

  const [{ data, fetching }] = useMeQuery();
  const [{}, logout] = useLogoutMutation();

  let userSection = null;
  if (fetching) {
    // Do nothing
  } else if (!data?.me) {
    // User not logged in
    userSection = (
      <>
        <NextLink href="/login">
          <Link mr={5}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link mr={5}>Register</Link>
        </NextLink>
      </>
    );
  } else {
    // User logged in
    userSection = (
      <Menu>
        <MenuButton
          as={Button}
          mr={5}
          colorScheme={colorScheme}
          px={3}
          py={2}
          pr={4}
          h="unset"
          alignContent="center"
        >
          <Icon as={GiWalrusHead} mr={2} fontSize="xl" />
          {data.me.username}
        </MenuButton>
        <MenuList>
          <MenuItem
            onClick={async () => {
              logout();
            }}
            mr={5}
          >
            Logout
          </MenuItem>
        </MenuList>
      </Menu>
    );
  }

  return (
    <Flex
      bg={bg}
      color={color}
      px={4}
      py={2}
      justifyContent="flex-end"
      alignItems="center"
      position="sticky"
      top={0}
      zIndex={100}
      style={{ boxShadow: "0px 0px 1px 2px rgba(0,0,0,0.15)" }}
    >
      <NextLink href="/">
        <Flex mr="auto" align="center" cursor="pointer">
          <Icon as={GiWaterSplash} fontSize="3xl" color={linkColor} mr={2} />
          <b>Redditish</b>
        </Flex>
      </NextLink>
      <InputGroup maxW={500} mr="auto" d="none">
        <InputLeftElement
          pointerEvents="none"
          height="100%"
          children={<SearchIcon color="gray.300" />}
        />
        <Input type="text" placeholder="Search" h="unset" py={1} />
      </InputGroup>
      {userSection}
      <DarkModeSwitch />
    </Flex>
  );
};

export default Navbar;
