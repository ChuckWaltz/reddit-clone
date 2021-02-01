import {
  CombinedError,
  dedupExchange,
  errorExchange,
  fetchExchange,
  Operation,
  stringifyVariables,
} from "urql";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import {
  RegisterMutation,
  MeDocument,
  MeQuery,
  LoginMutation,
} from "../generated/graphql";
import Router from "next/router";

// Allows to properly cast the types for URQL when updating cache
/* function customUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
} */

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

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
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
            cache.updateQuery({ query: MeDocument }, (data: MeQuery | null) => {
              if (!data) return null;

              if (registerMutation.register.errors) {
                return data;
              }

              data.me = registerMutation.register.user;
              return data;
            });
          },
          login: (result, _args, cache, _info) => {
            const loginMutation = result as LoginMutation;
            cache.updateQuery({ query: MeDocument }, (data: MeQuery | null) => {
              if (!data) return null;

              if (loginMutation.login.errors) {
                return data;
              }

              data.me = loginMutation.login.user;
              return data;
            });
          },
          logout: (_result, _args, cache, _info) => {
            cache.updateQuery({ query: MeDocument }, (data: MeQuery | null) => {
              if (!data) return null;

              data.me = null;
              return data;
            });
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
});
