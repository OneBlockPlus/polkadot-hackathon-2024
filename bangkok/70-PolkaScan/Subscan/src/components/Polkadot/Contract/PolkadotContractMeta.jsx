import React, { useState } from "react";
import axios from 'axios';

function PolkadotContractMeta() {
    const [contractMeta, setContractMeta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [contractAddress, setContractAddress] = useState("5F7HkPZ2M5MNN9DojqC8qNR4iAEKu1nPZ99oGPfBumgHmcWm"); // Set default address

    const fetchContractMeta = () => {
        setLoading(true);
        setError(null);

        const data = {
            "contract": contractAddress // Pass the contract address from state
        };

        const config = {
            method: 'post',
            url: 'https://polkadot.api.subscan.io/api/scan/contracts/meta',
            headers: { 
                'User-Agent': 'Apidog/1.0.0 (https://apidog.com)', 
                'Content-Type': 'application/json',
                'X-API-Key': '311e618de4bc4a6687fcbe8f1e8c910f' // API key authorization
            },
            data: data // Include data in the request
        };

        axios(config)
            .then(function (response) {
                if (response.data.code === 0) {
                    setContractMeta(response.data); // Set the API response data to state
                } else {
                    setError(`Error: ${response.data.message}`); // Handle API error messages
                }
                setLoading(false);
            })
            .catch(function (err) {
                console.error('Error details:', err.response); // Log the full error response
                setError(`Failed to fetch contract metadata: ${err.response?.data?.message || err.message}`);
                setLoading(false);
            });
    };

    return (
        <div className="p-5">
            <h2 className="text-2xl font-bold mb-4 text-pink-500">Polkadot Contract Metadata</h2>

            <input 
                type="text" 
                placeholder="Enter Contract Address" 
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)} // Update state on change
                className="border border-purple-500 p-2 mb-4 w-full"
            />
            <button 
                onClick={fetchContractMeta} 
                className="px-4 py-2 bg-black text-white rounded-md"
            >
                Fetch Contract Meta
            </button>

            {loading && <p className="mt-4 text-black">Loading...</p>}
            {error && <p className="mt-4 text-red-600">{error}</p>}
            {contractMeta && (
                <div className="mt-4">
                    <h3 className="text-xl font-semibold">Contract Metadata</h3>
                    <pre className="bg-gray-200 p-4 rounded-md">
                        {JSON.stringify(contractMeta, null, 2)} {/* Pretty-print JSON */}
                    </pre>
                </div>
            )}
        </div>
    );
}

export default PolkadotContractMeta;
