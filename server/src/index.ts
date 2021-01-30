import path from "path";
import express from "express";
import "reflect-metadata";
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

// Declaration merging for session data
declare module "express-session" {
  export interface SessionData {
    userId: number;
  }
}

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    host: "192.168.1.79",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "redditclone",
    logging: true,
    //synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User, Post],
  });

  await conn.runMigrations();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new ioredis();

  app.use(
    cors({
      origin: "http://localhost:3000",
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
        sameSite: "lax", // protects against csrf (google for info)
        secure: __prod__, // cookie only works over https
      },
      saveUninitialized: false,
      secret: "dhjaklsjdklasjdlkasjdajsld",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ req, res, redis }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("Server Started - Listening on Port: 4000");
  });
};

main().catch((err) => {
  console.error(err);
});
