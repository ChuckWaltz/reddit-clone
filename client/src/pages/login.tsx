import React from "react";
import { Button, Divider, Flex, Heading, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";
import { colorScheme } from "../utils/constants";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

interface LoginProps {}

const Login: React.FC<LoginProps> = ({}) => {
  const router = useRouter();
  const [{}, login] = useLoginMutation();
  return (
    <Layout>
      <Wrapper size="small" formWrapper={true}>
        <Heading size="md" mb={4}>
          Login
        </Heading>
        <Divider />
        <Formik
          initialValues={{ usernameOrEmail: "", password: "" }}
          onSubmit={async (values, { setErrors }) => {
            console.log(values);
            try {
              const response = await login({
                usernameOrEmail: values.usernameOrEmail,
                password: values.password,
              });
              console.log(response);
              if (response.data?.login.errors) {
                setErrors(toErrorMap(response.data.login.errors));
              } else if (response.data?.login.user) {
                // Login worked - handle routing
                if (router.query.pr) {
                  // route to previous route (pr) if in query params
                  router.push(router.query.pr as string);
                } else {
                  router.push("/");
                }
              }
            } catch (error) {
              console.log(error);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="usernameOrEmail"
                label="Username or Email"
                placeholder="Enter username or email"
              />
              <InputField
                name="password"
                label="Password"
                placeholder="Enter a password"
                type="password"
              />
              <Flex flexDir="column">
                <NextLink href="/forgotPassword">
                  <Link ml="auto" mt={2} fontSize="sm">
                    Forgot Password?
                  </Link>
                </NextLink>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  colorScheme={colorScheme}
                  mt={6}
                  ml="auto"
                  px={8}
                >
                  Login
                </Button>
              </Flex>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
