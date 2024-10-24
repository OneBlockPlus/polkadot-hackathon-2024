import React, { useState } from "react";
import axios from 'axios';

const PolkadotVotedValidator = () => {
  const [votedValidators, setVotedValidators] = useState(null); // Start with null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVotedValidators = () => {
    setLoading(true);
    setError(null);

    const data = JSON.stringify({
      address: "14Y4s6V1PWrwBLvxW47gcYgZCGTYekmmzvFsK1kiqNH2d84t", // Replace with the actual Polkadot address
    });

    const config = {
      method: 'post',
      url: 'https://polkadot.api.subscan.io/api/scan/staking/voted',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 311e618de4bc4a6687fcbe8f1e8c910f' // Use your API key
      },
      data: data
    };

    axios(config)
      .then(function (response) {
        if (response.data.code === 0) {
          setVotedValidators(response.data.data.list);
        } else {
          throw new Error(response.data.message || "Failed to fetch data");
        }
        setLoading(false);
      })
      .catch(function (error) {
        setError('Failed to fetch voted validators');
        setLoading(false);
      });
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4 text-pink-500">Voted Validators</h2>

      {/* Fetch button */}
      <button
        onClick={fetchVotedValidators}
        className="bg-black text-white font-bold py-2 px-4 rounded"
      >
        Fetch Voted Validators
      </button>

      {/* Display loading, error, or data */}
      {loading && <p className="mt-4 text-black">Loading...</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {!loading && votedValidators && votedValidators.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Voted Validator Data</h3>
          <ul className="bg-gray-200 p-4 rounded-md">
            {votedValidators.map((validator, index) => (
              <li key={index} className="border-b py-2">
                <h4 className="font-semibold">
                  {validator.controller_account_display?.display || "Unknown"}
                </h4>
                <p>Status: {validator.status}</p>
                <p>Rank: {validator.rank_validator}</p>
                <p>Total Bonded: {validator.bonded_total}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && votedValidators?.length === 0 && !error && (
        <p className="mt-4 text-black">No voted validators found for this address.</p>
      )}
    </div>
  );
};

export default PolkadotVotedValidator;
