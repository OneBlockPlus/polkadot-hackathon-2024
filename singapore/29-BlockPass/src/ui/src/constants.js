import abi from './abi.json'
import { Contract } from 'ethers';


export const contractAddress = '0x8E82985eE184B5a90fea68F3329B247e33f36fE5';
export const contractInstance = new Contract(contractAddress, abi);