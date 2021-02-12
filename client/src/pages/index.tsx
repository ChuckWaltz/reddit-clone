import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import {
  Button,
  Flex,
  Icon,
  Input,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import Layout from "../components/Layout";
import React, { useState } from "react";
import { colorScheme } from "../utils/constants";
import NextLink from "next/link";
import PostCard from "../components/PostCard";
import { GiFountainPen } from "react-icons/gi";

const Index = () => {
  const [postQueryVariables, setPostQueryVariables] = useState({
    limit: 15,
    cursor: null,
  });

  const [{ data, fetching }] = usePostsQuery({
    variables: {
      limit: postQueryVariables.limit,
      cursor: postQueryVariables.cursor,
    },
  });

  const inputCardBGColor = useColorModeValue("white", "rgb(25, 25, 25)");
  const inputCardTextColor = useColorModeValue("gray.800", "white");

  return (
    <Layout size="large">
      <Flex mt={4} flexDir="column">
        <Flex
          shadow="md"
          borderWidth="1px"
          borderRadius={5}
          backgroundColor={inputCardBGColor}
          color={inputCardTextColor}
          p={3}
          mb={4}
        >
          <NextLink href="/createPost">
            <Input type="text" mr={3} placeholder="Create Post" />
          </NextLink>
          <NextLink href="/createPost">
            <Button colorScheme={colorScheme} p={0}>
              <Icon as={GiFountainPen} fontSize="lg" />
            </Button>
          </NextLink>
        </Flex>
        <Stack spacing={4}>
          {data?.posts.posts.map((p) =>
            !p ? null : <PostCard key={p.id} post={p} />
          )}
        </Stack>
        <Button
          disabled={fetching || !data || !data.posts.hasMore}
          colorScheme={colorScheme}
          display="inline-flex"
          my={6}
          onClick={() => {
            setPostQueryVariables({
              limit: postQueryVariables.limit,
              cursor: data?.posts.posts[data?.posts.posts.length - 1].createdAt,
            });
          }}
        >
          Load More
        </Button>
      </Flex>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
