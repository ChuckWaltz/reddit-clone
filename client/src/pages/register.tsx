import React from "react";
import { Button, Divider, Heading } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { colorScheme } from "../utils/constants";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

interface RegisterProps {}

const Register: React.FC<RegisterProps> = ({}) => {
  const router = useRouter();
  const [{}, register] = useRegisterMutation();
  return (
    <Layout>
      <Wrapper size="small" formWrapper={true}>
        <Heading size="md" mb={4}>
          User Registration
        </Heading>
        <Divider />
        <Formik
          initialValues={{ email: "", username: "", password: "" }}
          onSubmit={async (values, { setErrors }) => {
            console.log(values);
            try {
              const response = await register({
                options: {
                  email: values.email,
                  username: values.username,
                  password: values.password,
                },
              });
              console.log(response);
              if (response.data?.register.errors) {
                setErrors(toErrorMap(response.data.register.errors));
              } else if (response.data?.register.user) {
                // Register worked - route to home page
                router.push("/");
              }
            } catch (error) {
              console.log(error);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="username"
                label="Username"
                placeholder="Enter a username"
              />
              <InputField
                name="email"
                label="Email Address"
                placeholder="Enter an email address"
              />
              <InputField
                name="password"
                label="Password"
                placeholder="Enter a password"
                type="password"
              />
              <Button
                type="submit"
                isLoading={isSubmitting}
                colorScheme={colorScheme}
                mt={6}
                px={6}
                float="right"
              >
                Register
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Register);
