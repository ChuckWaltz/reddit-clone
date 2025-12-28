import path from "path";
import express from "express";
import "reflect-metadata";
import "dotenv-safe/config";

import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";

import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { PostResolver } from "./resolvers/PostResolver";
import { UserResolver } from "./resolvers/UserResolver";

import session from "express-session";
import ioredis from "ioredis";
import connectRedis from "connect-redis";

import cors from "cors";

import { __prod__, COOKIE_NAME } from "./constants";
import { MyContext } from "./types";
import { Vote } from "./entities/Vote";
import { createUserLoader } from "./utils/createUserLoader";
import { createVoteLoader } from "./utils/createVoteLoader";

// Declaration merging for session data
declare module "express-session" {
  export interface SessionData {
    userId: number;
  }
}

const main = async () => {
  const _conn = await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: true,
    synchronize: !__prod__,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User, Post, Vote],
  });

  if (__prod__) await _conn.runMigrations();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new ioredis(process.env.REDIS_URL);

  app.set("trust proxy", 1); // Tells express we have a proxy sitting in front (nginx) so cookies/sessions etc. work

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 Year
        httpOnly: true,
        sameSite: __prod__ ? "none" : "lax", // "none" required for cross-site cookies
        secure: __prod__, // cookie only works over https
        domain: process.env.COOKIE_DOMAIN || undefined, // Remove hardcoded domain
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      voteLoader: createVoteLoader(),
    }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(parseInt(process.env.PORT), () => {
    console.log("Server Started --- Listening on Port: 4000");
  });
};

main().catch((err) => {
  console.error(err);
});
