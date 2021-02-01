import { NextRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = async (router: NextRouter) => {
  const [{ fetching, data }] = useMeQuery();

  // Check if user is logged in and redirect if not
  useEffect(() => {
    if (!fetching && !data?.me) {
      router.replace("/login?pr=" + router.pathname);
    }
  }, [fetching, data, router]);
};
