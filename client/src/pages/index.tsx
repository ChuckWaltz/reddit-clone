import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { Button, Flex, Stack } from "@chakra-ui/react";
import Layout from "../components/Layout";
import React, { useState } from "react";
import { colorScheme } from "../utils/constants";
import NextLink from "next/link";
import PostCard from "../components/PostCard";

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

  return (
    <Layout>
      <Flex mt={4} flexDir="column">
        <NextLink href="/createPost">
          <Button ml="auto" mb={4} colorScheme={colorScheme}>
            Create Post
          </Button>
        </NextLink>
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
