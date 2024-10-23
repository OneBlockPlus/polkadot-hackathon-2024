import abi from "./abi.json";
import { Contract } from "ethers";

export const contractAddress = "0xbeE78e505F7e36e1dBC37e2BE8C0Ae753478810B";
export const contractInstance = new Contract(contractAddress, abi);
