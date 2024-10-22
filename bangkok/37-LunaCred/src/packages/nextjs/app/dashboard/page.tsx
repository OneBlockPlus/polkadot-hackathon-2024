import Data from "./Data";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { gql, request } from "graphql-request";

const query = gql`
  {
    credibilityUpdateds(first: 5) {
      id
      user
      newCredibility
      blockNumber
    }
    deposits(first: 5) {
      id
      from
      recipient
      value
    }
  }
`;
const url = "https://api.studio.thegraph.com/query/92118/lunacred-subgraph/version/latest";
export default async function HomePage() {
  const queryClient = new QueryClient();
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
}
