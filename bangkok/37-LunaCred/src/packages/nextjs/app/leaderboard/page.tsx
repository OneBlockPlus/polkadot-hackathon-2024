import Data from "./Data";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { useAccount } from "wagmi";

const url = "https://api.studio.thegraph.com/query/92118/lunacred-subgraph/version/latest";
const HomePage = async () => {
  const queryClient = new QueryClient();
  const query = gql`
    {
      deposits(first: 5) {
        id
        from
        recipient
        value
        credibilityAdded
        blockNumber
        blockTimestamp
        transactionHash
      }
    }
  `;
  await queryClient.prefetchQuery({
    queryKey: ["data"],
    async queryFn() {
      return await request(url, query);
    },
  });
  return (
    // Neat! Serialization is now as easy as passing props.
    // HydrationBoundary is a Client Component, so hydration will happen there.
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Data />
    </HydrationBoundary>
  );
};

export default HomePage;
