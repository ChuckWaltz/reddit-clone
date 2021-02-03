import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import {
  Box,
  Button,
  Flex,
  Heading,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Layout from "../components/Layout";
import React, { useState } from "react";
import { colorScheme } from "../utils/constants";
import NextLink from "next/link";

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

  const formatPostedDate = (dateString: string) => {
    const now = new Date().getTime() / 1000; //seconds since epoch
    const date = new Date(dateString).getTime() / 1000; //seconds since epoch
    const diff = now - date;
    const mins = diff / 60;
    const hours = mins / 60;
    const days = hours / 24;

    if (diff <= 60) return "less than a minute";

    let val: string;
    if (days > 1) {
      const d = Math.floor(days);
      val = d.toString() + " day";
      if (d > 1) val += "s";
    } else if (hours > 1) {
      const h = Math.floor(hours);
      val = h.toString() + " hour";
      if (h > 1) val += "s";
    } else if (mins > 1) {
      const m = Math.floor(mins);
      val = m.toString() + " minute";
      if (m > 1) val += "s";
    } else {
      const s = Math.floor(diff);
      val = s.toString() + " second";
      if (s > 1) val += "s";
    }
    return val;
  };

  const stackItemBg = useColorModeValue("white", "rgb(25, 25, 25)");
  const stackItemColor = useColorModeValue("gray.800", "white");

  return (
    <Layout>
      <Flex mt={4} flexDir="column">
        <NextLink href="/createPost">
          <Button ml="auto" mb={4} colorScheme={colorScheme}>
            Create Post
          </Button>
        </NextLink>
        <Stack spacing={4}>
          {data?.posts.posts.map((p) => (
            <Box
              key={p.id}
              p={5}
              shadow="md"
              borderWidth="1px"
              borderRadius={5}
              backgroundColor={stackItemBg}
              color={stackItemColor}
            >
              <Heading fontSize="xl">{p.title}</Heading>
              <Text fontSize="xs" mt={1}>
                Posted By: {p.creator.username} {formatPostedDate(p.createdAt)}{" "}
                ago
              </Text>
              <Text fontSize="md" mt={4}>
                {p.textSnippet}
              </Text>
            </Box>
          ))}
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
