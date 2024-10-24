import React, { useState } from "react";

function PolkadotAccountStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAccountStats = () => {
        setLoading(true);
        setError(null);

        const myHeaders = new Headers();
        myHeaders.append("User-Agent", "Apidog/1.0.0 (https://apidog.com)");
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            exclude_system: true,
            type: "assets",
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };

        fetch("https://polkadot.api.subscan.io/api/scan/accounts/statistics", requestOptions)
            .then((response) => response.json())
            .then((result) => {
                if (result && result.data) {
                    setStats(result.data);
                } else {
                    setError("No stats available.");
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching statistics:", error);
                setError("Failed to fetch account stats");
                setLoading(false);
            });
    };

    return (
        <div className="p-5">
            <h2 className="text-2xl font-bold mb-4 text-pink-500">Polkadot Account Statistics</h2>

            {/* Button to trigger fetch */}
            <button
                onClick={fetchAccountStats}
                className="px-4 py-2 bg-black text-white rounded-md"
            >
                Fetch Account Statistics
            </button>

            {/* Display loading, error or data */}
            {loading && <p className="mt-4 text-black">Loading...</p>}
            {error && <p className="mt-4 text-red-600">{error}</p>}
            {stats && (
                <div className="mt-4">
                    <h3 className="text-xl font-semibold">Statistics</h3>
                    <pre className="bg-gray-200 p-4 rounded-md">
                        {JSON.stringify(stats, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}

export default PolkadotAccountStats;
