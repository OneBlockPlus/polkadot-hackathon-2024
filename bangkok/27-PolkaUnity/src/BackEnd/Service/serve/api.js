const subscan = require("./SubScan")
const ethers = require('ethers');

const PolkadotURL = "https://polkadot.api.subscan.io/"
const VaraURL = "https://vara.api.subscan.io/"
const MoonbeamURL = "https://moonbeam.api.subscan.io"

const URL = [PolkadotURL, VaraURL, MoonbeamURL]

const fs = require("fs");
const path = require('path')
const data = fs.readFileSync(path.resolve(__dirname, '../config.json'), 'UTF-8').toString()
const config = JSON.parse(data)

const abi = JSON.parse(fs.readFileSync("./abis/oat-abi"));
const provider = new ethers.getDefaultProvider(config['provider']);
const privateKey = config['private_key'];
const wallet = new ethers.Wallet(privateKey, provider);
const ContractAddr = config['contract_addr'];
const contract = new ethers.Contract(ContractAddr, abi, provider);
const contractWithSigner = contract.connect(wallet);

// const address = "16MtM3VFtwbEhwAr7V3mDiHqghtXQqZa5YzD85Qmma7kWxY7"
// const address = "114SUbKCXjmb9czpWTtS3JANSmNRwVa4mmsMrWYpRG1kDH5"
// const address = "0x8C599E8f9B5d15d3Adf89D856f34fFEC8De0B2c6"

module.exports = {
    // post: { body: {address: string}}
    queryTransfer: async (req, res) => {
        address = req.body.address;

        var year = await subscan.queryTransfer(PolkadotURL, address);

        res.json({
            msg: "ok"
        })
    },

    mintOAT: async(req, res) => {
        address = req.body.address;

        var years = 0

        URL.forEach(async (url, i) => {
            var temp_year = await subscan.queryTransfer(url, address);

            if (years < temp_year) {
                years = temp_year;
            }
        });

        var transfers_count = 0;

        URL.forEach(async (url, i) => {
            var temp_count = await subscan.queryExtrinsicList(url, address)

            transfers_count += temp_count;
        });

        var tx1 = await contractWithSigner.mintOAT(
            address,
            "Creation OAT",
            years,
            "test oat",
            1,
        );

        console.log(tx1.hash);
        console.log("Creation OAT:" + tx1 + "\n"); 
        console.log("Creation OAT:" + JSON.stringify(tx1) + "\n");

        var tx2 = await contractWithSigner.mintOAT(
            address,
            "Transfers OAT",
            transfers_count,
            "test oat",
            2,
        );

        console.log(tx2.hash);
        console.log("Transfers OAT:" + tx2 + "\n"); 
        console.log("Transfers OAT:" + JSON.stringify(tx2) + "\n");

        res.json({
            msg: "ok",
            tx1: tx1,
            tx2: tx2
        });
    }
}