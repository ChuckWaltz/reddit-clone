import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constants";
import { UserInput } from "../types/UserInput";
import { validateRegister } from "../utils/validateRegister";
import { FieldError } from "../types/FieldError";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    //User not logged in
    if (!req.session.userId) {
      return null;
    }

    const res: User | undefined = await User.findOne(req.session.userId);
    return res;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UserInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) return { errors };

    const hashedPassword = await argon2.hash(options.password);
    try {
      let user = new User();
      user.email = options.email;
      user.username = options.username;
      user.password = hashedPassword;

      const res: User = await User.save(user);

      console.log(res);

      // Save cookie
      req.session.userId = user.id;

      return { user: res };
    } catch (err) {
      // Duplicate username error
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
      // Handle other errors
      return {
        errors: [
          {
            field: "undefined",
            message: err.message,
          },
        ],
      };
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user: User | undefined = await User.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }], // Will execute OR
    });
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "Username or email doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect password",
          },
        ],
      };
    }

    // Save cookie
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
          return resolve(false);
        }

        res.clearCookie(COOKIE_NAME);
        return resolve(true);
      });
    });
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user: User | undefined = await User.findOne({
      where: { email },
    });
    if (!user) {
      return true; // Just return true to prevent spamming
    }

    const token = v4();

    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24
    ); // Expire after 24 hours

    await sendEmail(
      email,
      "Reddit Lite Password Reset",
      `<a href='http://localhost:3000/passwordReset/${token}'>Reset Password</a>`
    );

    return true;
  }

  @Mutation(() => UserResponse)
  async resetPassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { req, redis }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Must be at least 3 characters",
          },
        ],
      };
    }

    const key = FORGOT_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "Token is expired",
          },
        ],
      };
    }

    const user = await User.findOne(userId);
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "User no longer exists",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(newPassword);
    user.password = hashedPassword;

    await User.save(user);

    await redis.del(key); // Remove key so cannot reset again

    req.session.userId = user.id;

    return { user };
  }
}
