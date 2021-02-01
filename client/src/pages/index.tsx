import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import Layout from "../components/Layout";
import React, { useState } from "react";
import { colorScheme } from "../utils/constants";
import NextLink from "next/link";

const Index = () => {
  const [postQueryVariables, setPostQueryVariables] = useState({
    limit: 10,
    cursor: null,
  });

  const [{ data, fetching }] = usePostsQuery({
    variables: {
      limit: postQueryVariables.limit,
      cursor: postQueryVariables.cursor,
    },
  });

  return (
    <Layout>
      <Flex mt={4} flexDir="column">
        <NextLink href="/createPost">
          <Button ml="auto" mb={4} colorScheme={colorScheme}>
            Create Post
          </Button>
        </NextLink>
        <Stack spacing={8}>
          {data?.posts.posts.map((p) => (
            <Box key={p.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{p.title}</Heading>
              <Text mt={4}>{p.textSnippet}</Text>
            </Box>
          ))}
        </Stack>
        <Button
          disabled={fetching || !data || !data.posts.hasMore}
          display="inline-flex"
          my={8}
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
