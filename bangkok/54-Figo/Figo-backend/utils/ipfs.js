export const hash = 'QmPv5aSX2skY1zhn6K6rrfkcJSidSRJiAchUv6qxZ3KzPK';

export async function fetchIPFSMetadata(tokenId) {
    try {
        const response = await fetch(
            `https://green-elderly-sheep-310.mypinata.cloud/ipfs/${hash}/${tokenId}.json`
        );
        if (!response.ok) throw new Error(`Pinata error, status: ${response.status}`);

        return await response.json();
    } catch (error) {
        console.error('Error fetching IPFS metadata', error);
    }
}
