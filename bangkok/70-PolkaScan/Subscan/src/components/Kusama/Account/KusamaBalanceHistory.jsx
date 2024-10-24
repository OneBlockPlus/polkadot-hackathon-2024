

import React, { useState } from "react";
import axios from "axios";

function KusamaBalanceHistory() {
    const [balanceHistory, setBalanceHistory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [address, setAddress] = useState(""); // State to store user input address

    const fetchBalanceHistory = () => {
        if (!address) {
            setError("Please enter a valid address");
            return;
        }

        setLoading(true);
        setError(null);

        const data = JSON.stringify({
            address: address, // Use the user input address
            start: "2022-01-01",  // Start date (YYYY-MM-DD format)
            end: "2023-01-01",    // End date (YYYY-MM-DD format)
            recent_block: 10000   // Optional, can be adjusted or removed
        });

        const config = {
            method: "post",
            url: "https://kusama.api.subscan.io/api/scan/account/balance_history",
            headers: {
                "User-Agent": "Apidog/1.0.0 (https://apidog.com)",
                "Content-Type": "application/json",
                Authorization: "Bearer 311e618de4bc4a6687fcbe8f1e8c910f", // Replace with a valid API key
            },
            data: data,
        };

        axios(config)
            .then(function (response) {
                setBalanceHistory(response.data);
                setLoading(false);
            })
            .catch(function (error) {
                setError("Failed to fetch balance history");
                setLoading(false);
            });
    };

    return (
        <div className="p-5">
            <h2 className="text-2xl font-bold mb-4 text-pink-500">Kusama Balance History</h2>

            {/* Input for the address */}
            <input
                type="text"
                placeholder="Enter Kusama Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mb-4 p-2 border border-purple-500 bg-black text-white rounded-md w-full"
            />

            <button
                onClick={fetchBalanceHistory}
                className="px-4 py-2 bg-black text-white rounded-md"
            >
                Fetch Balance History
            </button>

            {/* Display loading, error or data */}
            {loading && <p className="mt-4 text-black">Loading...</p>}
            {error && <p className="mt-4 text-red-600">{error}</p>}
            {balanceHistory && (
                <div className="mt-4">
                    <h3 className="text-xl font-semibold">Balance History</h3>
                    <pre className="bg-gray-200 p-4 rounded-md">
                        {JSON.stringify(balanceHistory, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}

export default KusamaBalanceHistory;


// EDsG379yD3tKk1SYaBjcUqynEgtEqmDVbsXysk2ipDuWspr
