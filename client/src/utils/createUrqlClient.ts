import {
  CombinedError,
  dedupExchange,
  errorExchange,
  fetchExchange,
  gql,
  Operation,
  stringifyVariables,
} from "urql";
import { cacheExchange, Resolver, Cache } from "@urql/exchange-graphcache";
import {
  RegisterMutation,
  MeDocument,
  MeQuery,
  LoginMutation,
  VoteMutation,
  VoteMutationVariables,
  DeletePostMutationVariables,
} from "../generated/graphql";
import Router from "next/router";
import { isServer } from "./isServer";

// Allows to properly cast the types for URQL when updating cache
/* function customUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
} */

const invalidateAllPosts = (cache: Cache) => {
  const allFields = cache.inspectFields("Query");
  const fieldInfos = allFields.filter((info) => info.fieldName === "posts");
  fieldInfos.forEach((fi) => {
    cache.invalidate("Query", "posts", fi.arguments || undefined);
  });
};

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    //console.log(entityKey, fieldName);
    const allFields = cache.inspectFields(entityKey);
    //console.log("allFields: ", allFields);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    //console.log("fieldInfos: ", fieldInfos);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    //console.log("fieldArgs: ", fieldArgs);
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    //console.log("key created: ", fieldKey);
    const isInCache = cache.resolve(
      cache.resolve(entityKey, fieldKey) as string,
      "posts"
    );
    //console.log("isInCache: ", isInCache);
    info.partial = !isInCache;

    let results: string[] = [];
    let hasMore = true;

    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const posts = cache.resolve(key, "posts") as string[];
      if (!cache.resolve(key, "hasMore")) hasMore = false;
      results.push(...posts);
    });

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results,
    };
  };
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = "";
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie; // Need to tell Next.js to send cookie to GraphQL if requests are made via SSR
  }

  return {
    url: process.env.NEXT_PUBLIC_API_URL as string,
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie ? { cookie } : undefined,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null, // Tells URQL that this type doesn't have an id/key. Could also tell it an actual id field if we had one
          PostSnippet: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            register: (result, _args, cache, _info) => {
              const registerMutation = result as RegisterMutation;
              cache.updateQuery(
                { query: MeDocument },
                (data: MeQuery | null) => {
                  if (!data) return null;

                  if (registerMutation.register.errors) {
                    return data;
                  }

                  data.me = registerMutation.register.user;
                  return data;
                }
              );
              invalidateAllPosts(cache);
            },
            login: (result, _args, cache, _info) => {
              const loginMutation = result as LoginMutation;
              cache.updateQuery(
                { query: MeDocument },
                (data: MeQuery | null) => {
                  if (!data) return null;

                  if (loginMutation.login.errors) {
                    return data;
                  }

                  data.me = loginMutation.login.user;
                  return data;
                }
              );
              invalidateAllPosts(cache);
            },
            logout: (_result, _args, cache, _info) => {
              cache.updateQuery(
                { query: MeDocument },
                (data: MeQuery | null) => {
                  if (!data) return null;

                  data.me = null;
                  return data;
                }
              );
              invalidateAllPosts(cache);
            },
            createPost: (_result, _args, cache, _info) => {
              invalidateAllPosts(cache);
            },
            deletePost: (_result, args, cache, _info) => {
              const { id: postId } = args as DeletePostMutationVariables;
              cache.invalidate({ __typename: "Post", id: postId });
            },
            vote: (result, args, cache, _info) => {
              const { postId, value } = args as VoteMutationVariables;
              const voteMutation = result as VoteMutation;
              if (!voteMutation.vote) return null;
              cache.writeFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voted
                  }
                `,
                { id: postId, points: voteMutation.vote.points, voted: value }
              );
            },
            /* register: (_result, _args, _cache, _info) => {
            customUpdateQuery<RegisterMutation, MeQuery>(
              _cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user,
                  };
                }
              }
            );
          }, */
            /* login: (_result, _args, _cache, _info) => {
            customUpdateQuery<LoginMutation, MeQuery>(
              _cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              }
            );
          }, */
          },
        },
      }),
      errorExchange({
        onError: (error: CombinedError, _operation: Operation) => {
          if (error.message.toLowerCase().includes("not authenticated")) {
            Router.replace("/login");
          }
        },
      }),
      ssrExchange,
      fetchExchange,
    ],
  };
};
