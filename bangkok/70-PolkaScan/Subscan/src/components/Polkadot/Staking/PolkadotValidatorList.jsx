import React, { useState } from "react";
import axios from 'axios';

function PolkadotValidatorList() {
    const [validatorData, setValidatorData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchValidatorData = () => {
        setLoading(true);
        setError(null);

        const raw = JSON.stringify({
            "order": "desc",
            "order_field": "rank_validator",
            "page": 0,
            "row": 10
        });

        const config = {
            method: 'post',
            url: 'https://polkadot.api.subscan.io/api/scan/staking/validators',
            headers: { 
                'User-Agent': 'Apidog/1.0.0 (https://apidog.com)', 
                'Content-Type': 'application/json'
            },
            data: raw
        };

        axios(config)
        .then(function (response) {
            setValidatorData(response.data.data.list);
            setLoading(false);
        })
        .catch(function (error) {
            setError('Failed to fetch validator data');
            setLoading(false);
        });
    };

    return (
        <div className="p-5">
            <h2 className="text-2xl font-bold mb-4 text-pink-500">Validator List</h2>
            
            <button 
                onClick={fetchValidatorData} 
                className="px-4 py-2 bg-black text-white rounded-md"
            >
                Fetch Validator List
            </button>

            {/* Display loading, error or data */}
            {loading && <p className="mt-4 text-black">Loading...</p>}
            {error && <p className="mt-4 text-red-600">{error}</p>}
            {validatorData && validatorData.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-xl font-semibold">Validator Data</h3>
                    <ul className="bg-gray-200 p-4 rounded-md">
                        {validatorData.map((validator, index) => (
                            <li key={index} className="border-b py-2">
                                <h4 className="font-semibold">{validator.controller_account_display.display}</h4>
                                <p>Status: {validator.status}</p>
                                <p>Rank: {validator.rank_validator}</p>
                                <p>Total Bonded: {validator.bonded_total}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default PolkadotValidatorList;
