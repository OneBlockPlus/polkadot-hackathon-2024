// src/app/pools/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { useWallet } from '@/providers/WalletProvider';
import {
  Container,
  Grid,
  Box,
  Text,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  Badge,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Skeleton,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { formatNumber, hexToAscii } from '@/lib/utils';
import Link from 'next/link';

// Types for our pool data
interface Pool {
  id: string;
  synthetic_asset: {
    id: string;
    symbol: string;
    name: string;
    price: string;
  };
  total_debt: string;
  params: {
    debt_ceiling: string;
    is_minting_allowed: boolean;
    is_burning_allowed: boolean;
  };
}

type SortOption = 'tvl' | 'utilization' | 'price' | 'name';

export default function PoolsPage() {
  const { pallets } = useApi();
  const { account } = useWallet();
  const [pools, setPools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('tvl');

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchPools = async () => {
      if (!pallets) return;

      try {
        setIsLoading(true);
        const DUMMY = "5CY7psennQRJm9PFg59r8Dd6DSwr7D8LgzBX3mwRKP3uy6ee";
        const allPools = await pallets.queries.pools.getAllPools(DUMMY);
        
        console.log("allPools", allPools);
        setPools(allPools);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch pools'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPools();
  }, [pallets]);

  const sortedAndFilteredPools = useMemo(() => {
    const filtered = pools.filter(pool => 
      hexToAscii(pool.synthetic_asset.symbol).toLowerCase().includes(searchQuery.toLowerCase()) ||
      hexToAscii(pool.synthetic_asset.name).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'tvl':
          return Number(b.total_debt) - Number(a.total_debt);
        case 'utilization':
          const utilA = (Number(a.total_debt) / Number(a.params.debt_ceiling)) * 100;
          const utilB = (Number(b.total_debt) / Number(b.params.debt_ceiling)) * 100;
          return utilB - utilA;
        case 'price':
          return Number(b.synthetic_asset.price) - Number(a.synthetic_asset.price);
        case 'name':
          return hexToAscii(a.synthetic_asset.symbol).localeCompare(hexToAscii(b.synthetic_asset.symbol));
        default:
          return 0;
      }
    });
  }, [pools, searchQuery, sortBy]);

  const getSortLabel = (sort: SortOption): string => {
    switch (sort) {
      case 'tvl': return 'Total Value Locked';
      case 'utilization': return 'Utilization';
      case 'price': return 'Price';
      case 'name': return 'Name';
      default: return '';
    }
  };

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" rounded="lg">
          <AlertIcon />
          {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Flex justify="space-between" align="center" mb={6}>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold">Synthetic Asset Pools</Text>
              <Text color="gray.600">
                Mint and manage synthetic assets backed by your collateral
              </Text>
            </VStack>
            {!account && (
              <Button colorScheme="blue" onClick={() => window.location.href = '/connect'}>
                Connect Wallet to Start
              </Button>
            )}
          </Flex>

          {/* Filters */}
          <Grid templateColumns={{ base: '1fr', md: '1fr auto' }} gap={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search pools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                Sort by: {getSortLabel(sortBy)}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setSortBy('tvl')}>Total Value Locked</MenuItem>
                <MenuItem onClick={() => setSortBy('utilization')}>Utilization</MenuItem>
                <MenuItem onClick={() => setSortBy('price')}>Price</MenuItem>
                <MenuItem onClick={() => setSortBy('name')}>Name</MenuItem>
              </MenuList>
            </Menu>
          </Grid>
        </Box>

        {/* Pool Grid */}
        {isLoading ? (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
            {[...Array(6)].map((_, i) => (
              <Box key={i} p={6} bg={cardBg} rounded="xl" shadow="sm" border="1px" borderColor={borderColor}>
                <VStack align="stretch" spacing={4}>
                  <Skeleton height="24px" width="120px" />
                  <Skeleton height="40px" />
                  <Skeleton height="60px" />
                </VStack>
              </Box>
            ))}
          </Grid>
        ) : (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
            {sortedAndFilteredPools.map((pool) => {
              const utilization = (Number(pool.total_debt) / Number(pool.params.debt_ceiling)) * 100;
              
              return (
                <Link href={`/pools/${pool.id}`} key={pool.id}>
                  <Box 
                    p={6} 
                    bg={cardBg} 
                    rounded="xl" 
                    shadow="sm"
                    border="1px"
                    borderColor={borderColor}
                    transition="all 0.2s"
                    _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                  >
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xl" fontWeight="bold">
                            {hexToAscii(pool.synthetic_asset.name)}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Synthetic {hexToAscii(pool.synthetic_asset.symbol)}
                          </Text>
                        </VStack>
                        <Badge colorScheme={pool.params.is_minting_allowed ? 'green' : 'red'}>
                          {pool.params.is_minting_allowed ? 'Active' : 'Paused'}
                        </Badge>
                      </HStack>

                      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <Stat>
                          <StatLabel>Price</StatLabel>
                          <StatNumber fontSize="lg">
                            ${formatNumber(Number(pool.synthetic_asset.price) / 10 ** 8)}
                          </StatNumber>
                        </Stat>
                        <Stat textAlign={'right'}>
                          <StatLabel>Total Debt</StatLabel>
                          <StatNumber fontSize="lg">
                            ${formatNumber((Number(pool.total_debt) / 10 ** pool.synthetic_asset.decimals) || 0)}
                          </StatNumber>
                        </Stat>
                      </Grid>

                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" color="gray.600">Utilization</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {(Number(utilization) || 0).toFixed(1)}%
                          </Text>
                        </HStack>
                        <Box bg="gray.100" rounded="full" h="2">
                          <Box
                            bg={utilization > 90 ? 'red.500' : utilization > 75 ? 'orange.500' : 'blue.500'}
                            h="2"
                            rounded="full"
                            width={`${utilization}%`}
                          />
                        </Box>
                      </Box>

                      {account && (
                        <Button 
                          size="sm" 
                          colorScheme="blue" 
                          width="full"
                          variant="outline"
                        >
                          View Pool
                        </Button>
                      )}
                    </VStack>
                  </Box>
                </Link>
              );
            })}
          </Grid>
        )}

        {!isLoading && sortedAndFilteredPools.length === 0 && (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg" color="gray.600">
              No pools found matching your search
            </Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
}