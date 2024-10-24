import React, { useEffect, useState } from 'react';

const MoonbeamBlockList = () => {
  const [blockData, setBlockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlockList = async () => {
      const data = JSON.stringify({
        "page": 0,
        "row": 10
      });

      try {
        const response = await fetch('https://moonbeam.api.subscan.io/api/v2/scan/blocks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'User-Agent': 'Apidog/1.0.0 (https://apidog.com)' // Not allowed in browsers
          },
          body: data,
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        setBlockData(result.data.blocks);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockList();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching block list: {error.message}</div>;
  }

  return (
    <div>
      <h2>Block List</h2>
      <ul>
        {blockData.map((block) => (
          <li key={block.hash}>
            <p><strong>Block Number:</strong> {block.block_num}</p>
            <p><strong>Block Hash:</strong> {block.hash}</p>
            <p><strong>Timestamp:</strong> {block.block_timestamp}</p>
            <p><strong>Finalized:</strong> {block.finalized ? 'Yes' : 'No'}</p>
            <p><strong>Event Count:</strong> {block.event_count}</p>
            <p><strong>Extrinsics Count:</strong> {block.extrinsics_count}</p>
            {/* Add more details as needed */}
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MoonbeamBlockList;
