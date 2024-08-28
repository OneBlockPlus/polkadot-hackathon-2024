import Card from '../../components/components/Card';
import NFTCard from '../../components/components/NFTCard';
import { NFT } from '../../data-model/nft';

const CollectiblesPanel = ({nfts}:{nfts:NFT[]}) => {
  const mockNFTs: NFT[] = [
    {
      id: 0,
      url: 'https://marketplace.canva.com/EAFG5wKTkFk/1/0/1131w/canva-pastel-food-drive-a4-flyer-tBm19VC3AKU.jpg',
      name: 'NFT LSP9',
      highestBid: { date: '20 Nov 2022 01:15PM', bidAmount: 20, bidder: 'Barry Bono', walletAddress: 'wallet-address', bidderUserId: 1 },
      bidHistory: [
        { date: '20 Nov 2022 01:15PM', bidAmount: 20, bidder: 'Bert Bono', walletAddress: 'wallet-address-1', bidderUserId: 0 },
        { date: '19 Nov 2022 01:15PM', bidAmount: 19, bidder: 'Barry Bono', walletAddress: 'wallet-address-2', bidderUserId: 1 },
        { date: '18 Nov 2022 01:15PM', bidAmount: 18, bidder: 'Bevin Bono', walletAddress: 'wallet-address-3', bidderUserId: 2 }
      ],
      description: 'A description about the token and why its worth bidding for.'
    },
    {
      id: 1,
      url: 'https://marketplace.canva.com/EAFG5wKTkFk/1/0/1131w/canva-pastel-food-drive-a4-flyer-tBm19VC3AKU.jpg',
      name: 'NFT LSP9',
      highestBid: { date: '20 Nov 2022 01:15PM', bidAmount: 20, bidder: 'Barry Bono', walletAddress: 'wallet-address', bidderUserId: 1 },
      bidHistory: [{ date: '20 Nov 2022 01:15PM', bidAmount: 20, bidder: 'Barry Bono', walletAddress: 'wallet-address', bidderUserId: 1 }],
      description: 'A description about the token and why its worth bidding for.'
    },
    {
      id: 2,
      url: 'https://marketplace.canva.com/EAFG5wKTkFk/1/0/1131w/canva-pastel-food-drive-a4-flyer-tBm19VC3AKU.jpg',
      name: 'NFT LSP9',
      highestBid: { date: '20 Nov 2022 01:15PM', bidAmount: 20, bidder: 'Barry Bono', walletAddress: 'wallet-address', bidderUserId: 1 },
      bidHistory: [{ date: '20 Nov 2022 01:15PM', bidAmount: 20, bidder: 'Barry Bono', walletAddress: 'wallet-address', bidderUserId: 1 }],
      description: 'A description about the token and why its worth bidding for.'
    }
  ];

  return (
    <Card>
      <div className="w-full flex flex-wrap gap-6">{nfts && nfts.length > 0 ? nfts.map((nft, i) => <NFTCard className="max-w-[calc(50%-12px)] flex-1 basis-[calc(50%-12px)] border-beerus border !shadow-none" item={nft} key={i} display={true} />) : <>You don't have activity yet</>}</div>
    </Card>
  );
};

export default CollectiblesPanel;
