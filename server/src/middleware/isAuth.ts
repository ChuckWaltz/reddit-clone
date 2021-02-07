import { MyContext } from "src/types";
import { MiddlewareFn } from "type-graphql";

// Middleware to ensure user is logged in
export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error("Not Authenticated");
  }

  return next();
};
