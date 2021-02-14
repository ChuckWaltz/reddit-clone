import React from "react";
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Link,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  PostSnippetFragment,
  useDeletePostMutation,
  useMeQuery,
  useVoteMutation,
} from "../generated/graphql";
import { colorScheme } from "../utils/constants";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DeleteIcon,
  EditIcon,
} from "@chakra-ui/icons";
import NextLink from "next/link";
import { formatPostedDate } from "../utils/formatPostedDate";

interface PostCardProps {
  post: PostSnippetFragment;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const postCardBGColor = useColorModeValue("white", "rgb(25, 25, 25)");
  const postCardTextColor = useColorModeValue("gray.800", "white");
  const votePanelBGColor = useColorModeValue("gray.100", "rgb(35, 35, 35)");
  const voteButtonColor = useColorModeValue(
    `${colorScheme}.600`,
    `${colorScheme}.300`
  );
  const voteButtonDisabled = useColorModeValue("gray.400", "gray.600");

  const [{ data }] = useMeQuery();
  const [{}, vote] = useVoteMutation();
  const [{}, deletePost] = useDeletePostMutation();

  return (
    <Flex
      shadow="md"
      borderWidth="1px"
      borderRadius={8}
      backgroundColor={postCardBGColor}
      color={postCardTextColor}
      flexGrow={1}
      overflow="hidden"
      cursor="pointer"
      _hover={{ boxShadow: "0px 0px 0px 1px gray" }}
    >
      <Flex
        flexDir="column"
        alignItems="center"
        p={1}
        bgColor={votePanelBGColor}
      >
        <IconButton
          aria-label="Upvote"
          icon={
            <ChevronUpIcon
              fontSize="2em"
              color={post.voted === 1 ? voteButtonColor : voteButtonDisabled}
            />
          }
          onClick={() => {
            vote({ postId: parseInt(post.id), value: 1 });
          }}
          _focus={{ outlineColor: "none" }}
        />
        <Box p={1}>{post.points}</Box>
        <IconButton
          aria-label="Downvote"
          icon={
            <ChevronDownIcon
              fontSize="2em"
              color={post.voted === -1 ? voteButtonColor : voteButtonDisabled}
            />
          }
          onClick={() => {
            vote({ postId: parseInt(post.id), value: -1 });
          }}
          _focus={{ outlineColor: "none" }}
        />
      </Flex>
      <NextLink href="/post/[id]" as={`/post/${post.id}`}>
        <Flex flexDirection="column" py={2} px={4} flexGrow={1} role="group">
          <Heading fontSize="xl">{post.title}</Heading>
          <Text fontSize="xs" mt={1}>
            Posted By: {post.creator.username}{" "}
            {formatPostedDate(post.createdAt)} ago
          </Text>
          <Text fontSize="md" mt={4}>
            {post.textSnippet}
          </Text>
        </Flex>
      </NextLink>
      <Flex bgColor={votePanelBGColor} p={3} flexDir="column">
        <IconButton
          size="sm"
          as={Link}
          icon={<DeleteIcon />}
          aria-label="Delete Post"
          opacity={data?.me?.id === post.creator.id ? 1 : 0}
          pointerEvents={data?.me?.id === post.creator.id ? "initial" : "none"}
          variant="outline"
          colorScheme="red"
          onClick={() => {
            deletePost({ id: parseInt(post.id) });
          }}
        />
        <NextLink href="/post/edit/[id]" as={`/post/edit/${post.id}`}>
          <IconButton
            size="sm"
            as={Link}
            icon={<EditIcon />}
            aria-label="Edit Post"
            opacity={data?.me?.id === post.creator.id ? 1 : 0}
            pointerEvents={
              data?.me?.id === post.creator.id ? "initial" : "none"
            }
            colorScheme={colorScheme}
            mt="auto"
          />
        </NextLink>
      </Flex>
    </Flex>
  );
};

export default PostCard;
