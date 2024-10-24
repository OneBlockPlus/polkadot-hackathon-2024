import React, { useState } from 'react';

const MoonbeamNFTHolders = () => {
  const [collectionId, setCollectionId] = useState(''); // State for input field
  const [holdersData, setHoldersData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // For loading state

  const fetchNFTHolders = async () => {
    if (!collectionId) {
      setError('Please enter a valid collection ID');
      return;
    }

    setLoading(true);
    setError(null); // Reset error before fetching new data
    const myHeaders = new Headers();
    myHeaders.append("User-Agent", "Apidog/1.0.0 (https://apidog.com)");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("X-API-Key", "311e618de4bc4a6687fcbe8f1e8c910f"); // Add your API key here

    const raw = JSON.stringify({
      "collection_id": collectionId, // Use the input collection ID
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
      const response = await fetch("https://moonbeam.api.subscan.io/api/scan/nfts/info/holders", requestOptions);
      const result = await response.json();

      console.log("Response:", result); // Log the API response for debugging

      if (result.code === 0) {
        setHoldersData(result.data);
      } else {
        setError(result.message || 'Failed to fetch NFT holders');
      }
    } catch (error) {
      setError('An error occurred while fetching data');
      console.error('Error:', error);
    } finally {
      setLoading(false); // Stop loading after the request is done
    }
  };

  return (
    <div>
      <h2 className='text-xl font-bold text-pink-500'>Polkadot NFT Holders</h2>
      
      {/* Input field for Collection ID */}
      <div>
        <input
          className='bg-black border-transparent text-white mt-[20px]'
          type="text"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          placeholder="Enter Collection ID"
          style={{ padding: '8px', width: '100%', maxWidth: '600px' }}
        />
      </div>

      {/* Button to fetch NFT Holders */}
      <div style={{ marginTop: '10px' }}>
        <button onClick={fetchNFTHolders} style={{ padding: '8px 16px' }} className='bg-black text-white border border-2 px-[5px] py-[3px] rounded-lg border-transparent'>
          Fetch NFT Holders
        </button>
      </div>

      {/* Loading, Error, and Data Display */}
      {loading && <p>Loading NFT holders...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {holdersData && (
        <div>
          <p>Total Holders: {holdersData.count}</p>
          <ul>
            {holdersData.list.map((holderData, index) => (
              <li key={index}>
                <p><strong>Holder Address:</strong> {holderData.holder.address}</p>
                <p><strong>Balance:</strong> {holderData.balance}</p>
                <p><strong>Display Name:</strong> {holderData.holder.display}</p>
                {holderData.holder.evm_contract && (
                  <p><strong>Contract Name:</strong> {holderData.holder.evm_contract.contract_name}</p>
                )}
                {holderData.holder.judgements && holderData.holder.judgements.length > 0 && (
                  <p><strong>Judgements:</strong> {holderData.holder.judgements.map(j => j.judgement).join(", ")}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MoonbeamNFTHolders;
