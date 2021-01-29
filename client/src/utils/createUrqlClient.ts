import { dedupExchange, fetchExchange } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import {
  RegisterMutation,
  MeDocument,
  MeQuery,
  LoginMutation,
} from "../generated/graphql";

// Allows to properly cast the types for URQL when updating cache
/* function customUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
} */

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
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
    ssrExchange,
    fetchExchange,
  ],
});
