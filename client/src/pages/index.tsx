import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import {
  Button,
  Flex,
  Icon,
  Input,
  Skeleton,
  SkeletonText,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import Layout from "../components/Layout";
import React, { useState } from "react";
import { colorScheme } from "../utils/constants";
import NextLink from "next/link";
import PostCard from "../components/PostCard";
import { GiFountainPen } from "react-icons/gi";

const PostCardSkeleton = () => {
  const bg = useColorModeValue("white", "rgb(25, 25, 25)");
  const sideBg = useColorModeValue("gray.100", "rgb(35, 35, 35)");

  return (
    <Flex
      shadow="md"
      borderWidth="1px"
      borderRadius={8}
      backgroundColor={bg}
      overflow="hidden"
    >
      <Flex
        flexDir="column"
        alignItems="center"
        p={3}
        bgColor={sideBg}
        w="50px"
      >
        <Skeleton h="24px" w="24px" mb={2} />
        <Skeleton h="16px" w="20px" mb={2} />
        <Skeleton h="24px" w="24px" />
      </Flex>
      <Flex flexDirection="column" py={3} px={4} flexGrow={1}>
        <Skeleton h="20px" w="60%" mb={2} />
        <Skeleton h="12px" w="40%" mb={4} />
        <SkeletonText noOfLines={2} spacing={2} />
      </Flex>
    </Flex>
  );
};

const Index = () => {
  const [postQueryVariables, setPostQueryVariables] = useState({
    limit: 15,
    offset: 0,
  });

  const [{ data, fetching }] = usePostsQuery({
    variables: {
      limit: postQueryVariables.limit,
      offset: postQueryVariables.offset,
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
          borderRadius={8}
          backgroundColor={inputCardBGColor}
          color={inputCardTextColor}
          p={3}
          mb={4}
          overflow="hidden"
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
          {fetching && !data
            ? Array.from({ length: 5 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))
            : data?.posts.posts.map((p) =>
                !p ? null : <PostCard key={p.id} post={p} />,
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
              offset:
                (postQueryVariables.offset || 0) + postQueryVariables.limit,
            });
          }}
        >
          Load More
        </Button>
      </Flex>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(Index);
