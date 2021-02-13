import { Flex, Button, Spinner, Box, Divider, Heading } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../../../components/InputField";
import Layout from "../../../components/Layout";
import Wrapper from "../../../components/Wrapper";
import {
  useMeQuery,
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import { colorScheme } from "../../../utils/constants";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useIsAuth } from "../../../utils/useIsAuth";

const EditPost = () => {
  const router = useRouter();
  useIsAuth(router);

  const [{ data: meData, fetching: meFetching }] = useMeQuery();

  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;

  const [{ data: postData, fetching: postFetching }] = usePostQuery({
    pause: intId === -1, // Don't run the query if we have a bad URL parameter (id)
    variables: {
      id: intId,
    },
  });

  const [{}, updatePost] = useUpdatePostMutation();

  if (postFetching) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }

  if (!postData?.post) {
    return (
      <Layout>
        <Box>Could not find post.</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Wrapper size="normal" formWrapper={true}>
        {meFetching || !meData?.me ? (
          <Spinner m="auto" mt={8} />
        ) : (
          <>
            <Heading size="md" mb={4}>
              Edit Post
            </Heading>
            <Divider />
            <Formik
              initialValues={{
                title: postData?.post.title,
                text: postData?.post.text,
              }}
              onSubmit={async (values) => {
                const response = await updatePost({
                  id: intId,
                  title: values.title,
                  text: values.text,
                });

                if (!response.error) {
                  router.back();
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form>
                  <InputField
                    name="title"
                    label="Title"
                    placeholder="Enter a title..."
                  />
                  <InputField
                    textarea
                    name="text"
                    label="Text"
                    placeholder="Enter post text..."
                  />
                  <Flex>
                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      colorScheme={colorScheme}
                      mt={6}
                      ml="auto"
                      px={8}
                    >
                      Update
                    </Button>
                  </Flex>
                </Form>
              )}
            </Formik>
          </>
        )}
      </Wrapper>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
