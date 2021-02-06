import React from "react";
import { Box, Flex, Heading, Text, useColorModeValue } from "@chakra-ui/react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";
import { colorScheme } from "../utils/constants";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

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

  const [{}, vote] = useVoteMutation();

  return (
    <Flex
      shadow="md"
      borderWidth="1px"
      borderRadius={5}
      backgroundColor={postCardBGColor}
      color={postCardTextColor}
      flexGrow={1}
    >
      <Flex
        flexDir="column"
        alignItems="center"
        p={1}
        bgColor={votePanelBGColor}
      >
        <ChevronUpIcon
          cursor="pointer"
          fontSize="2em"
          color={post.voted === 1 ? voteButtonColor : voteButtonDisabled}
          onClick={() => {
            vote({ postId: parseInt(post.id), value: 1 });
          }}
        />
        <Box p={1}>{post.points}</Box>
        <ChevronDownIcon
          cursor="pointer"
          fontSize="2em"
          color={post.voted === -1 ? voteButtonColor : voteButtonDisabled}
          onClick={() => {
            vote({ postId: parseInt(post.id), value: -1 });
          }}
        />
      </Flex>
      <Flex flexDirection="column" py={2} px={4}>
        <Heading fontSize="xl">{post.title}</Heading>
        <Text fontSize="xs" mt={1}>
          Posted By: {post.creator.username} {formatPostedDate(post.createdAt)}{" "}
          ago
        </Text>
        <Text fontSize="md" mt={4}>
          {post.textSnippet}
        </Text>
      </Flex>
    </Flex>
  );
};

export default PostCard;
