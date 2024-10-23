import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionRepository } from './repository/position.repository';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { BN, BN_ONE } from '@polkadot/util';
import axios from 'axios';
import contractAbi from "./utils/abis/oracle.json";
import type { WeightV2 } from '@polkadot/types/interfaces';


const contractAddress = '16WNTZoQuUAEac5ou1R5xCX944B8WhoL4aDxoVaVWWTwjcWJ';

@Injectable()
export class PositionService {
  private readonly baseUrl = 'https://api.binance.com';

  private readonly wsProvider = new WsProvider("wss://rpc1.paseo.popnetwork.xyz");
  private api: ApiPromise;

  constructor(private readonly positionRepository: PositionRepository) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async updateOraclePrice() {
    const apiPromise = await ApiPromise.create({ provider: this.wsProvider });
    const contract = new ContractPromise(apiPromise, contractAbi, contractAddress);
    // console.log(contract);

    const keyring = new Keyring({ type: 'sr25519' });
    const mnemonic = 'gallery boring general usage salmon stone tomorrow tongue furnace glide resource clutch';
    const signer = keyring.addFromMnemonic(mnemonic);

    const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);

    // const readOnlyGasLimit = this.api.registry.createType('WeightV2', {
    //   refTime: new BN(1_000_000_000_000),
    //   proofSize: MAX_CALL_WEIGHT,
    // }) as WeightV2;

    const price = await this.getDotPrice();
    const gasLimit = 20000n * 10000000n;
    const storageDepositLimit = null;

    const { gasRequired, storageDeposit, result } = await contract.query.changePrice(signer.address, { storageDepositLimit: null, gasLimit: -1 }, new BN(1000));
    // console.log(storageDeposit, result);
    const tx = contract.tx["changePrice"]({ gasLimit: gasRequired, storageDepositLimit }, new BN(1000));


    // const unsub = await tx.signAndSend(signer, async (result) => {
    //   const isFinalized = result?.status?.isFinalized;
    //   if (!isFinalized) return

    //   // Determine extrinsic and block info
    //   const extrinsicHash = result.txHash.toHex()
    //   const extrinsicIndex = result.txIndex
    //   const blockHash = result.status.asFinalized.toHex()

    //   console.log(extrinsicHash, extrinsicIndex, blockHash);
    // }); 

    // const temp = await contract.tx.changePrice(
    //   {
    //     storageDepositLimit,
    //     gasLimit,
    //     value: 1n,
    //   },
    //   1000n
    // ).signAndSend(signer, result => {
    //   if (result.status.isInBlock) {
    //     console.log('in a block');
    //   } else if (result.status.isFinalized) {
    //     console.log('finalized');
    //   }
    // }).then((e) => {
    //   console.log(e);
    // });



    

    console.log(price);
  }

  async create(createPositionDto: CreatePositionDto) {
    // await this.contract.tx.open_position(
    //   { value: 0 },
    //   createPositionDto.token,
    //   createPositionDto.amount,
    //   createPositionDto.position_type,
    //   createPositionDto.leverage,
    //   createPositionDto.user,
    // );

    return (await this.positionRepository.create(createPositionDto)).toObject();
  }

  async getAllPositionsByUser(user: string) {
    return await this.positionRepository.findAllPositionByUser(user);
  }

  async remove(position_id: number) {
    return await this.positionRepository.delete(position_id);
  }

  async findAll() {
    return await this.positionRepository.findAll();
  }

  async findOne(position_id: number) {
    return await this.positionRepository.findOne(position_id);
  }

  async update(position_id: number, updatePositionDto: UpdatePositionDto) {
    return await this.positionRepository.update(position_id, updatePositionDto);
  }

  async getDotPrice(): Promise<number> {
    try {
      const url = `${this.baseUrl}/api/v3/ticker/price?symbol=DOTUSDT`;
      const response = await axios.get(url);
      const price = parseFloat(response.data.price);

      return price;
    } catch (error) {
      console.error('Error fetching price:', error.message);
      throw error;
    }
  }


}
