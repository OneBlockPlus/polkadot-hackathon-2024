"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import axios from "axios";
const ethers_1 = require("ethers");
const IApplication_json_1 = __importDefault(require("./IApplication.json"));
const AccessIdentities_json_1 = __importDefault(require("./AccessIdentities.json"));
// const NOTIFY_API = process.env.NOTIFY_API || "https://localhost:1234/notify";
const DEVICE = process.env.DEVICE;
const PORT = process.env.PORT || 3155;
const ACCESS_IDENTITIES = process.env.ACCESS_IDENTITIES || "0x4Cd640e4177a5d86B06BDB147E7efECFf3E478b3";
const APPLICATION = process.env.APPLICATION || "0xf628B6024af73D0f29c251e0fB306e5f8bA6FcFA";
const RPC = process.env.RPC ||
    "https://base-sepolia-rpc.publicnode.com";
if (!DEVICE) {
    throw new Error("env variable `DEVICE` undefined");
}
const provider = new ethers_1.ethers.providers.JsonRpcProvider(RPC);
const applicationContract = new ethers_1.ethers.Contract(APPLICATION, IApplication_json_1.default.abi, provider);
const accessIdentitiesContract = new ethers_1.ethers.Contract(ACCESS_IDENTITIES, AccessIdentities_json_1.default.abi, provider);
// applicationContract.on("Transfer", async (from: string, to: string, tokenId: ethers.BigNumber, event) => {
//   if (from !== ethers.constants.AddressZero) {
//     console.log(`Transfer from ${from} to ${to}, tokenId: ${tokenId.toString()}`);
//     const response = await axios.post(NOTIFY_API, {from});
//     console.log(`Notification[transfer] sent, response status: ${response.status}`);
//   }
//   if (to === ethers.constants.AddressZero) {
//     console.log(`Token ${tokenId.toString()} burned from ${from}`);
//     const response = await axios.post(NOTIFY_API, {from});
//     console.log(`Notification[burn] sent, response status: ${response.status}`);
//   }
// });
let cachedIdentities = [];
const updateIdenntities = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessIds = yield applicationContract.getAccessesByDevice(DEVICE);
        const owners = yield Promise.all(accessIds.map((accessId) => __awaiter(void 0, void 0, void 0, function* () {
            return yield applicationContract.ownerOf(accessId);
        })));
        const identities = yield Promise.all(owners.map((owner) => __awaiter(void 0, void 0, void 0, function* () {
            return yield accessIdentitiesContract.getIdentities(owner);
        })));
        cachedIdentities = identities.flat();
    }
    catch (error) {
        console.error("Error in program:", error);
    }
});
updateIdenntities();
setInterval(updateIdenntities, 60 * 1000);
const app = (0, express_1.default)();
app.get("/access", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { peer_id } = req.query;
    if (!peer_id) {
        return res.status(400).json({ error: "Missing required parameters" });
    }
    try {
        const data = !!cachedIdentities.find((identity) => identity.digest === peer_id);
        res.json({ data });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
