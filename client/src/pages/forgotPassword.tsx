import { Button, useToast } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import React from "react";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import Wrapper from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { colorScheme } from "../utils/constants";
import { createUrqlClient } from "../utils/createUrqlClient";

interface ForgotPasswordProps {}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({}) => {
  const [{}, forgotPassword] = useForgotPasswordMutation();
  const toast = useToast();
  return (
    <Layout>
      <Wrapper size="small">
        <Formik
          initialValues={{ email: "" }}
          onSubmit={async (values) => {
            console.log(values);
            try {
              await forgotPassword({
                email: values.email,
              });
              toast({
                title: "Pretend Email Sent!",
                description:
                  "This is just a project made for fun, so no real emails are being sent. Sorry!",
                status: "success",
                duration: 5000,
                isClosable: true,
              });
            } catch (error) {
              console.log(error);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="email"
                label="Email Address"
                placeholder="Enter email address associated with account"
              />
              <Button
                type="submit"
                isLoading={isSubmitting}
                colorScheme={colorScheme}
                mt={4}
              >
                Reset Password
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
