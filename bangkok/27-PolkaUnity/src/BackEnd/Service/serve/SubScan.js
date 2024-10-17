const fs = require("fs");
const path = require('path')
const data = fs.readFileSync(path.resolve(__dirname, '../config.json'), 'UTF-8').toString()
const config = JSON.parse(data)

const api_key = config['api_key'];

function calculate_to_years(timestamp) {
    let now = new Date().valueOf() / 1000;
    console.log("当前时间戳：", now);
    console.log("区块时间戳：", timestamp);
    let diff = now - timestamp;
    let days = diff / 86400;
    console.log("账户已存在：", days, "天");

    return days / 365
}

module.exports = {
    queryTransfer: async function(url, address) {
        var api = url + "api/v2/scan/transfers"; 

        var myHeaders = new Headers();
        myHeaders.append("User-Agent", "Apidog/1.0.0 (https://apidog.com)");
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-API-Key", api_key);

        const otherParam={
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({
                "address": address,
                "order": "asc",
                "page": 0,
                "row": 10
            }),
            redirect: 'follow',
        }

        var response = await fetch(api, otherParam);
        var result = response.json();
        return calculate_to_years(result.data.transfers[0].block_timestamp)
    },

    queryToken: function(url, address) {
        var api = url + "api/scan/account/tokens";

        var myHeaders = new Headers();
        myHeaders.append("User-Agent", "Apidog/1.0.0 (https://apidog.com)");
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-API-Key", api_key);

        const otherParam={
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({
                "address": address,
            }),
            redirect: 'follow',
        }

        fetch(api, otherParam)
            .then(response => response.json())
            .then(result => {
                console.log(JSON.stringify(result));
                console.log(result.data.native[0].balance);
            })
            .catch((error) => {
                console.error(error);
            });
    },

    queryBalanceHistory: function(url, address) {
        var api = url + "api/scan/account/balance_history";

        var myHeaders = new Headers();
        myHeaders.append("User-Agent", "Apidog/1.0.0 (https://apidog.com)");
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-API-Key", api_key);

        var raw = JSON.stringify({
            "address": address,
            "start": "0"
         });

        const otherParam={
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        };

        fetch(api, otherParam)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch((error) => { 
                console.error(error);
            });
    },

    queryExtrinsicList: async function(url, address) {
        var api = url + "api/v2/scan/extrinsics";

        var myHeaders = new Headers();
        myHeaders.append("User-Agent", "Apidog/1.0.0 (https://apidog.com)");
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-API-Key", api_key);

        var raw = JSON.stringify({
            "address": address,
            "page": 0,
            "success": true,
            "row": 10
         });

        const otherParam={
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        };

        var response = await fetch(api, otherParam);
        var result = response.json();
        return calculate_to_years(result.data.count)
    }
}