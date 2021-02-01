import { Button, useToast } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import React from "react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import { toErrorMap } from "../../utils/toErrorMap";
import { useResetPasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";

const PasswordReset: NextPage = () => {
  const router = useRouter();
  const [{}, resetPassword] = useResetPasswordMutation();
  const toast = useToast();
  return (
    <Wrapper size="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          try {
            const response = await resetPassword({
              token: router.query.token as string,
              newPassword: values.newPassword,
            });
            console.log(response);
            if (response.data?.resetPassword.errors) {
              const errorMap = toErrorMap(response.data.resetPassword.errors);
              if ("token" in errorMap) {
                toast({
                  title: "An error occurred.",
                  description: errorMap.token,
                  status: "error",
                  duration: 5000,
                  isClosable: true,
                });
              } else {
                setErrors(errorMap);
              }
            } else if (response.data?.resetPassword.user) {
              // Reset password worked - route to home page
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
              name="newPassword"
              label="New Password"
              placeholder="Please enter a new password"
              type="password"
            />
            <Button
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
              mt={4}
            >
              Reset Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(PasswordReset);
