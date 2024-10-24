import React, { useEffect, useState } from 'react';

const MoonbeamNFTAccountBalance = () => {
  const [accountAddress, setAccountAddress] = useState(''); // To store input address
  const [collectionId, setCollectionId] = useState(''); // To store input collection ID
  const [nftData, setNftData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchNFTBalances = async () => {
    if (!accountAddress || !collectionId) {
      setError('Please enter a valid account address and collection ID.');
      return;
    }

    setLoading(true);
    setError(null); // Clear error before fetching new data

    const myHeaders = new Headers();
    myHeaders.append("User-Agent", "Apidog/1.0.0 (https://apidog.com)");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Api-Key", "311e618de4bc4a6687fcbe8f1e8c910f"); // Your API key

    const raw = JSON.stringify({
      "address": accountAddress, // Use input address
      "collection_id": collectionId, // Use input collection ID
      "page": 0,
      "row": 10
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    try {
      const response = await fetch("https://moonbeam.api.subscan.io/api/scan/nfts/account/balances", requestOptions);
      const result = await response.json();

      if (result.code === 0) {
        setNftData(result.data);
      } else {
        setError(result.message || 'Failed to fetch NFT balances');
      }
    } catch (error) {
      setError('An error occurred while fetching data.');
      console.error('Error:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div>
      <h2 className='text-xl font-bold text-pink-500'>Polkadot NFT Account Balance</h2>

      <div>
        <input
          className='bg-black border-transparent text-white mt-[20px]'
          type="text"
          value={accountAddress}
          onChange={(e) => setAccountAddress(e.target.value)}
          placeholder="Enter Account Address"
          style={{ padding: '8px', width: '100%', maxWidth: '600px' }}
        />
      </div>


      <div style={{ marginTop: '10px' }}>
        <button onClick={fetchNFTBalances} className='bg-black text-white border border-2 px-[5px] py-[3px] rounded-lg border-transparent'>
          Fetch NFT Balances
        </button>
      </div>

      {loading && <p>Loading NFT balances...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {nftData && (
        <div>
          <p><strong>Total NFTs:</strong> {nftData.count}</p>
          <ul>
            {nftData.list.map((nft, index) => (
              <li key={index}>
                <p><strong>Collection Name:</strong> {nft.collection_name}</p>
                <p><strong>Balance:</strong> {nft.balance}</p>
                <p><strong>Item ID:</strong> {nft.item_id}</p>
                <p><strong>Token Name:</strong> {nft.token_metadata.name}</p>
                <img src={nft.token_metadata.image} alt={nft.token_metadata.name} style={{ maxWidth: '200px' }} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MoonbeamNFTAccountBalance;
