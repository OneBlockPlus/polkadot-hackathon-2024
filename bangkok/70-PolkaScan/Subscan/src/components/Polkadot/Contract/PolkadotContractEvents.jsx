import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PolkadotContractEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContractEvents = async () => {
      const apiKey = "311e618de4bc4a6687fcbe8f1e8c910f"; // Your API key

      const config = {
        method: 'post',
        url: 'https://polkadot.api.subscan.io/api/scan/contracts/events',
        headers: {
          'User-Agent': 'Apidog/1.0.0 (https://apidog.com)',
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        data: JSON.stringify({
          "contract": "11YYjhjmjwn3csohNDLHa9Kr38nY8kd736a7TkPVagXoRus", // Replace with actual contract address
          "extrinsic_index": "actual_extrinsic_index", // Replace with actual extrinsic index
          "page": 0,
          "row": 10,
        }),
      };

      try {
        const response = await axios(config);

        // Handle success response from the API
        if (response.data.code === 0) {
          setEvents(response.data.data.events); // Assuming response.data.data.events contains the event list
        } else {
          setError(response.data.message || 'Error fetching contract events.');
        }
      } catch (error) {
        setError('Failed to fetch data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContractEvents();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Polkadot Contract Events</h2>
      <ul>
        {events.length > 0 ? (
          events.map((event, index) => (
            <li key={index}>
              <strong>Contract:</strong> {event.contract || 'N/A'} <br />
              <strong>Event Index:</strong> {event.extrinsic_index || 'N/A'} <br />
              <strong>Details:</strong> {JSON.stringify(event)}
            </li>
          ))
        ) : (
          <li>No events found.</li>
        )}
      </ul>
    </div>
  );
};

export default PolkadotContractEvents;
