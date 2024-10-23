// src/components/debug/ApiDebug.tsx
import { usePolkadot } from '@/providers/PolkadotProvider';
import { Box, Code, Heading, VStack, Text } from '@chakra-ui/react';

export const ApiDebug = () => {
  const { api, isLoading, error } = usePolkadot();

  if (isLoading) {
    return <Text>Loading API...</Text>;
  }

  if (error) {
    return <Text color="red.500">Error: {error.message}</Text>;
  }

  if (!api) {
    return <Text>API not initialized</Text>;
  }

  // Safe inspection of API structure
  const apiStructure = {
    rpc: {
      sections: Object.keys(api.rpc),
      pools: api.rpc.pools ? {
        type: typeof api.rpc.pools,
        methods: Object.getOwnPropertyNames(api.rpc.pools || {})
      } : 'Not available'
    },
    query: {
      sections: Object.keys(api.query),
      pools: api.query.pools ? {
        type: typeof api.query.pools,
        methods: Object.getOwnPropertyNames(api.query.pools || {})
      } : 'Not available'
    },
    tx: {
      sections: Object.keys(api.tx),
      pools: api.tx.pools ? {
        type: typeof api.tx.pools,
        methods: Object.getOwnPropertyNames(api.tx.pools || {})
      } : 'Not available'
    }
  };

  // Log raw RPC object for debugging
  console.log('Raw api.rpc:', api.rpc);
  console.log('Raw api.rpc.pools:', api.rpc.pools);
  console.log('Raw api.tx:', api.tx);

  return (
    <VStack align="stretch" spacing={4} p={4}>
      <Heading size="md">API Debug Information</Heading>
      
      <Box>
        <Text fontWeight="bold">RPC Structure:</Text>
        <Code display="block" whiteSpace="pre" p={2}>
          {JSON.stringify(apiStructure.rpc, null, 2)}
        </Code>
      </Box>

      <Box>
        <Text fontWeight="bold">Query Structure:</Text>
        <Code display="block" whiteSpace="pre" p={2}>
          {JSON.stringify(apiStructure.query, null, 2)}
        </Code>
      </Box>

      <Box>
        <Text fontWeight="bold">Transaction Structure:</Text>
        <Code display="block" whiteSpace="pre" p={2}>
          {JSON.stringify(apiStructure.tx, null, 2)}
        </Code>
      </Box>
    </VStack>
  );
};