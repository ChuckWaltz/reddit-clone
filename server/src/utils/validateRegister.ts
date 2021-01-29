import { FieldError } from "src/types/FieldError";
import { UserInput } from "src/types/UserInput";

export const validateRegister = (options: UserInput): FieldError[] | null => {
  if (options.username.length <= 2) {
    return [
      {
        field: "username",
        message: "Must be at least 3 characters",
      },
    ];
  }

  // TODO - Add actual email validation
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Invalid email address",
      },
    ];
  }

  if (options.password.length <= 2) {
    return [
      {
        field: "password",
        message: "Must be at least 3 characters",
      },
    ];
  }

  return null;
};
