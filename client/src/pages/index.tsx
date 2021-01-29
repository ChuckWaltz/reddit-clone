import Navbar from "../components/Navbar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { Spinner } from "@chakra-ui/react";

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <div></div>
      <Navbar />
      {!data ? (
        <Spinner />
      ) : (
        data.posts.map((p) => <div key={p.id}>{p.title}</div>)
      )}
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
