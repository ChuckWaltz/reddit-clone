import { Flex, Button, Spinner, Heading, Divider } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import Wrapper from "../components/Wrapper";
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import { colorScheme } from "../utils/constants";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/useIsAuth";

const CreatePost = () => {
  const router = useRouter();
  useIsAuth(router);
  const [{}, createPost] = useCreatePostMutation();
  const [{ fetching, data }] = useMeQuery();

  return (
    <Layout>
      <Wrapper size="normal" formWrapper={true}>
        {fetching || !data?.me ? (
          <Spinner m="auto" mt={8} />
        ) : (
          <>
            <Heading size="md" mb={4}>
              Create Post
            </Heading>
            <Divider />
            <Formik
              initialValues={{ title: "", text: "" }}
              onSubmit={async (values) => {
                const response = await createPost({
                  input: {
                    title: values.title,
                    text: values.text,
                  },
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
                      Post
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

export default withUrqlClient(createUrqlClient)(CreatePost);
