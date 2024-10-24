// import React, { useState } from "react";
// import axios from "axios";

// function PolkadotAccountList() {
//     const [accounts, setAccounts] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const fetchAccounts = () => {
//         setLoading(true);
//         setError(null);

//         const data = JSON.stringify({
//             account: "string",
//             address: ["12xtAYsRUrmbniiWQqJtECiBQrMn8AypQcXhnQAc6RB6XkLW"], // Example address
//             filter: "validator",
//             max_balance: "string",
//             min_balance: "string",
//             order: "desc",
//             order_field: "balance",
//             page: 0,
//             row: 10,
//         });

//         const config = {
//             method: "post",
//             url: "https://polkadot.api.subscan.io/api/v2/scan/accounts",
//             headers: {
//                 "User-Agent": "Apidog/1.0.0 (https://apidog.com)",
//                 "Content-Type": "application/json",
//                 Authorization: "Bearer 311e618de4bc4a6687fcbe8f1e8c910f", // Replace with a valid API key
//             },
//             data: data,
//         };

//         axios(config)
//             .then(function (response) {
//                 // Check the entire response
//                 console.log('Full Response:', response);

//                 if (response.data && response.data.data && response.data.data.list) {
//                     setAccounts(response.data.data.list);
//                 } else {
//                     setAccounts([]);
//                     setError("No accounts found.");
//                 }
//                 setLoading(false);
//             })
//             .catch(function (error) {
//                 console.error("Error fetching accounts:", error);
//                 setError("Failed to fetch account list");
//                 setLoading(false);
//             });
//     };

//     return (
//         <div className="p-5">
//             <h2 className="text-2xl font-bold mb-4 text-pink-500">Polkadot Account List</h2>
            
//             <button 
//                 onClick={fetchAccounts} 
//                 className="px-4 py-2 bg-black text-white rounded-md"
//             >
//                 Fetch Account List
//             </button>

//             {/* Display loading, error or data */}
//             {loading && <p className="mt-4 text-black">Loading...</p>}
//             {error && <p className="mt-4 text-red-600">{error}</p>}
//             {accounts && accounts.length > 0 && (
//                 <div className="mt-4">
//                     <h3 className="text-xl font-semibold">Account Details</h3>
//                     <pre className="bg-gray-200 p-4 rounded-md">
//                         {JSON.stringify(accounts, null, 2)}
//                     </pre>
//                 </div>
//             )}
//             {!loading && !error && accounts && accounts.length === 0 && (
//                 <p className="mt-4 text-black">No accounts found.</p>
//             )}
//         </div>
//     );
// }

// export default PolkadotAccountList;


import React, { useState } from "react";
import axios from "axios";

function PolkadotAccountList() {
    const [accounts, setAccounts] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [address, setAddress] = useState(""); // State for storing user input address

    const fetchAccounts = () => {
        if (!address) {
            setError("Please enter a valid address");
            return;
        }

        setLoading(true);
        setError(null);

        const data = JSON.stringify({
            account: "string",
            address: [address], // Use user-inputted address
            filter: "validator",
            max_balance: "string",
            min_balance: "string",
            order: "desc",
            order_field: "balance",
            page: 0,
            row: 10,
        });

        const config = {
            method: "post",
            url: "https://polkadot.api.subscan.io/api/v2/scan/accounts",
            headers: {
                "User-Agent": "Apidog/1.0.0 (https://apidog.com)",
                "Content-Type": "application/json",
                Authorization: "Bearer 311e618de4bc4a6687fcbe8f1e8c910f", // Replace with a valid API key
            },
            data: data,
        };

        axios(config)
            .then(function (response) {
                // Check the entire response
                console.log('Full Response:', response);

                if (response.data && response.data.data && response.data.data.list) {
                    setAccounts(response.data.data.list);
                } else {
                    setAccounts([]);
                    setError("No accounts found.");
                }
                setLoading(false);
            })
            .catch(function (error) {
                console.error("Error fetching accounts:", error);
                setError("Failed to fetch account list");
                setLoading(false);
            });
    };

    return (
        <div className="p-5">
            <h2 className="text-2xl font-bold mb-4 text-pink-500">Polkadot Account List</h2>

            {/* Input field for user to enter the address */}
            <input
                type="text"
                placeholder="Enter account"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mb-4 p-2 border border-purple-500 bg-black text-white rounded-md w-full"
            />

            <button 
                onClick={fetchAccounts} 
                className="px-4 py-2 bg-black text-white rounded-md"
            >
                Fetch Account List
            </button>

            {/* Display loading, error, or data */}
            {loading && <p className="mt-4 text-black">Loading...</p>}
            {error && <p className="mt-4 text-red-600">{error}</p>}
            {accounts && accounts.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-xl font-semibold">Account Details</h3>
                    <pre className="bg-gray-200 p-4 rounded-md">
                        {JSON.stringify(accounts, null, 2)}
                    </pre>
                </div>
            )}
            {!loading && !error && accounts && accounts.length === 0 && (
                <p className="mt-4 text-black">No accounts found.</p>
            )}
        </div>
    );
}

export default PolkadotAccountList;
