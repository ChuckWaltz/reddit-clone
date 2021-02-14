import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Box,
  Textarea,
} from "@chakra-ui/react";
import { useField } from "formik";
import React, { InputHTMLAttributes } from "react";

// Our component will have all the props of normal HTML input element
// Adding fields to base input to enfore required
type InputFieldProps = InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
> & {
  name: string;
  label: string;
  textarea?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({
  textarea,
  size: _, // Cannot pass size to Input, so stripping it off
  ...props
}) => {
  const [field, { error }] = useField(props);

  return (
    <Box mt={4}>
      <FormControl isInvalid={!!error}>
        <FormLabel htmlFor={field.name}>{props.label}</FormLabel>
        {textarea ? (
          <Textarea {...field} {...props} id={field.name} rows={10} />
        ) : (
          <Input {...field} {...props} id={field.name} />
        )}
        {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
      </FormControl>
    </Box>
  );
};

export default InputField;
