import {
  Box,
  Flex,
  Heading,
  Spinner,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import Layout from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { formatPostedDate } from "../../utils/formatPostedDate";

const Post = ({}) => {
  const router = useRouter();
  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1, // Don't run the query if we have a bad URL parameter (id)
    variables: {
      id: intId,
    },
  });

  const postBGColor = useColorModeValue("white", "rgb(25, 25, 25)");
  const postTextColor = useColorModeValue("gray.800", "white");

  if (fetching) {
    return (
      <Layout>
        <Spinner m="auto" mt={8} />
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find post.</Box>
      </Layout>
    );
  }

  return (
    <Layout size="normal">
      <Flex
        flexDir="column"
        backgroundColor={postBGColor}
        color={postTextColor}
        mt={4}
        p={6}
        pt={0}
        borderRadius={5}
        borderWidth={1}
      >
        <Heading mt={4} size="lg">
          {data.post.title}
        </Heading>
        <Text fontSize="sm" mt={1}>
          Posted By: {data.post.creator.username}{" "}
          {formatPostedDate(data.post.createdAt)} ago
        </Text>
        <Text mt={6}>{data.post.text}</Text>
      </Flex>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
