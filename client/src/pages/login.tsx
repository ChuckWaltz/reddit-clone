import React from "react";
import { Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/dist/client/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

interface LoginProps {}

const Login: React.FC<LoginProps> = ({}) => {
  const router = useRouter();
  const [{}, login] = useLoginMutation();
  return (
    <Wrapper size="small">
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
            <Button
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
              mt={4}
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
